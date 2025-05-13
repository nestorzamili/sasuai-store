import {
  Cart,
  TransactionData,
  ValidatedCartItem,
  ValidationResult,
  PaymentValidationResult,
  TransactionSummary,
  TransactionPaginationParams,
  DiscountType,
} from '@/lib/types/transaction';
import prisma from '@/lib/prisma';
import { calculateMemberPoints } from './setting.service';
import { errorHandling } from '../common/response-formatter';
import { format } from 'date-fns';

export class TransactionService {
  private static readonly STORE_PREFIX = 'SAS';
  private static readonly DATE_FORMAT = 'yyyyMMdd';

  static async validationCart(
    data: Cart,
  ): Promise<ValidationResult<ValidatedCartItem[]>> {
    // Extract product IDs for efficient batch query
    const productIds = data.map((item) => item.productId);

    // Fetch all required product data in a single query
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        batches: true,
        unit: true,
        discounts: true,
      },
    });

    const validatedItems: ValidatedCartItem[] = [];
    const errors: string[] = [];

    // Process each cart item
    for (const cartItem of data) {
      const product = products.find((p) => p.id === cartItem.productId);

      // Validation checks
      if (!product) {
        errors.push(`Product with ID ${cartItem.productId} not found`);
        continue;
      }

      if (product.currentStock <= 0 || !product.isActive) {
        errors.push(`Product ${product.id} is out of stock or inactive`);
        continue;
      }

      // Find valid non-expired batch with remaining quantity
      const validBatch = product.batches.find((batch) => {
        const isExpired = new Date(batch.expiryDate) < new Date();
        return !isExpired && batch.remainingQuantity > 0;
      });

      if (!validBatch) {
        errors.push(`No valid batch available for product ${product.id}`);
        continue;
      }

      // Get applicable discount - only if specifically selected
      let selectedDiscount = null;
      const now = new Date();

      if (cartItem.selectedDiscountId) {
        selectedDiscount = product.discounts.find(
          (discount) =>
            discount.id === cartItem.selectedDiscountId &&
            discount.isActive &&
            now >= discount.startDate &&
            now <= discount.endDate &&
            (!discount.maxUses || discount.usedCount < discount.maxUses),
        );

        if (cartItem.selectedDiscountId && !selectedDiscount) {
          errors.push(
            `Selected discount for product ${product.id} is not valid or has reached usage limit`,
          );
          continue;
        }
      }
      // We're not auto-selecting any discount when none is chosen

      // Calculate final price and subtotal
      const basicPrice = product.price;
      let discountValue = 0;
      let discountType = null;
      let discountId = null;

      if (selectedDiscount) {
        discountValue = selectedDiscount.value;
        discountType = selectedDiscount.type;
        discountId = selectedDiscount.id;
      }

      const finalPrice = this.calculateDiscountedPrice(
        basicPrice,
        discountValue,
        discountType,
      );
      const subtotal = finalPrice * cartItem.quantity;

      validatedItems.push({
        productId: product.id,
        batchId: validBatch.id,
        unitId: product.unitId,
        basicPrice: product.price,
        buyPrice: validBatch.buyPrice,
        quantity: cartItem.quantity,
        discount: selectedDiscount
          ? {
              id: selectedDiscount.id,
              value: selectedDiscount.value,
              type: selectedDiscount.type,
              valueType: selectedDiscount.type,
            }
          : null,
        discountedPrice: finalPrice,
        subtotal,
      });
    }

    return {
      success: errors.length === 0 && validatedItems.length > 0,
      message:
        errors.length > 0
          ? `Validation errors: ${errors.join('; ')}`
          : validatedItems.length === 0
          ? 'No valid items in cart'
          : 'Validation successful',
      data: validatedItems,
    };
  }

  private static calculateDiscountedPrice(
    basePrice: number,
    discountValue: number,
    discountType: string | null,
  ): number {
    if (!discountValue || !discountType) return basePrice;

    let discountedPrice = basePrice;

    if (discountType === 'PERCENTAGE') {
      const discountAmount = (discountValue * basePrice) / 100;
      discountedPrice = basePrice - discountAmount;
    } else if (discountType === 'FIXED_AMOUNT') {
      discountedPrice = basePrice - discountValue;
    }

    // Ensure price doesn't go below zero
    return Math.max(0, discountedPrice);
  }

  static async validationTransaction(
    validatedCart: ValidatedCartItem[],
    memberId: string | null | undefined = null,
    selectedMemberDiscountId: string | null = null,
    selectedTierDiscountId: string | null = null,
    globalDiscountCode: string | null = null,
  ): Promise<ValidationResult<TransactionSummary>> {
    // Calculate subtotal from all cart items
    const subtotal = validatedCart.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    // Get member discount info if applicable
    let memberInfo = null;
    if (memberId) {
      memberInfo = await this.getMemberInfo(memberId);
    }

    // Process discounts based on what was sent from frontend
    let appliedDiscount = null;
    let discountSource: 'global' | 'member' | 'tier' | null = null;

    // 1. If global discount code provided, validate and apply it
    if (globalDiscountCode) {
      const globalDiscount = await this.getGlobalDiscountInfo(
        globalDiscountCode,
        subtotal,
      );
      if (globalDiscount) {
        appliedDiscount = globalDiscount;
        discountSource = 'global';
      }
    }
    // 2. If member discount ID provided, validate and apply it
    else if (memberId && selectedMemberDiscountId) {
      const memberDiscount = await this.getMemberDiscountInfo(
        memberId,
        selectedMemberDiscountId,
        subtotal,
      );

      if (memberDiscount?.discount) {
        appliedDiscount = memberDiscount.discount;
        discountSource = 'member';
      }
    }
    // 3. If tier discount ID provided, validate and apply it
    else if (memberId && selectedTierDiscountId && memberInfo?.tierId) {
      const tierDiscount = await this.getTierDiscountInfo(
        memberInfo.tierId,
        selectedTierDiscountId,
        subtotal,
      );

      if (tierDiscount) {
        appliedDiscount = tierDiscount;
        discountSource = 'tier';
      }
    }

    // Calculate final amount
    const discountAmount = appliedDiscount?.amount || 0;
    const finalAmount = subtotal - discountAmount;

    return {
      success: true,
      message: 'Transaction validated successfully',
      data: {
        subtotal,
        member: memberInfo
          ? {
              ...memberInfo,
              discount:
                discountSource === 'member' || discountSource === 'tier'
                  ? appliedDiscount
                  : null,
            }
          : null,
        globalDiscount: discountSource === 'global' ? appliedDiscount : null,
        discountSource,
        finalAmount,
      },
    };
  }

  private static async getMemberDiscountInfo(
    memberId: string | null | undefined,
    selectedMemberDiscountId: string | null,
    subtotal: number,
  ) {
    if (!memberId) return null;

    // Get member with discount relations
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        discounts: true,
      },
    });

    if (!member) return null;

    // If no selected discount or no discounts available
    if (!selectedMemberDiscountId || !member.discounts?.length) {
      return { id: memberId, name: member.name, discount: null };
    }

    // Find the selected discount and validate it's applicable
    const now = new Date();
    const discount = member.discounts.find(
      (d) =>
        d.id === selectedMemberDiscountId &&
        d.isActive &&
        now >= d.startDate &&
        now <= d.endDate &&
        (!d.maxUses || d.usedCount < d.maxUses) &&
        (!d.minPurchase || subtotal >= d.minPurchase),
    );

    if (!discount) {
      return { id: memberId, name: member.name, discount: null };
    }

    // Calculate discount amount
    const discountAmount =
      discount.type === 'PERCENTAGE'
        ? (discount.value * subtotal) / 100
        : discount.type === 'FIXED_AMOUNT'
        ? discount.value
        : 0;

    return {
      id: memberId,
      name: member.name,
      discount:
        discountAmount > 0
          ? {
              id: discount.id,
              value: discount.value,
              type: discount.type as DiscountType,
              amount: discountAmount,
            }
          : null,
    };
  }

  // Get basic member info
  private static async getMemberInfo(memberId: string) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        tier: true,
      },
    });

    if (!member) return null;

    return {
      id: memberId,
      name: member.name,
      tierId: member.tierId,
      tierName: member.tier?.name,
    };
  }

  // Get tier-based discount
  private static async getTierDiscountInfo(
    tierId: string,
    discountId: string,
    subtotal: number,
  ) {
    // Get tier discount
    const tierDiscount = await prisma.discount.findFirst({
      where: {
        id: discountId,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        memberTiers: {
          some: { id: tierId },
        },
        OR: [
          { maxUses: null },
          { usedCount: { lt: prisma.discount.fields.maxUses } },
        ],
        AND: [
          {
            OR: [{ minPurchase: null }, { minPurchase: { lte: subtotal } }],
          },
        ],
      },
    });

    if (!tierDiscount) return null;

    // Calculate discount amount
    const discountAmount =
      tierDiscount.type === 'PERCENTAGE'
        ? (tierDiscount.value * subtotal) / 100
        : tierDiscount.type === 'FIXED_AMOUNT'
        ? tierDiscount.value
        : 0;

    return discountAmount > 0
      ? {
          id: tierDiscount.id,
          value: tierDiscount.value,
          type: tierDiscount.type as DiscountType,
          amount: discountAmount,
        }
      : null;
  }

  // Get global discount
  private static async getGlobalDiscountInfo(
    discountCode: string,
    subtotal: number,
  ) {
    // Get global discount by code
    const globalDiscount = await prisma.discount.findFirst({
      where: {
        code: discountCode,
        isGlobal: true,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        OR: [
          { maxUses: null },
          { usedCount: { lt: prisma.discount.fields.maxUses } },
        ],
        AND: [
          {
            OR: [{ minPurchase: null }, { minPurchase: { lte: subtotal } }],
          },
        ],
      },
    });

    if (!globalDiscount) return null;

    // Calculate discount amount
    const discountAmount =
      globalDiscount.type === 'PERCENTAGE'
        ? (globalDiscount.value * subtotal) / 100
        : globalDiscount.type === 'FIXED_AMOUNT'
        ? globalDiscount.value
        : 0;

    return discountAmount > 0
      ? {
          id: globalDiscount.id,
          code: globalDiscount.code,
          value: globalDiscount.value,
          type: globalDiscount.type as DiscountType,
          amount: discountAmount,
        }
      : null;
  }

  static async checkPaymentMethod(
    paymentMethod: string,
    cashAmount?: number,
    finalAmount?: number,
  ): Promise<PaymentValidationResult> {
    // Validate finalAmount is provided and valid
    if (!finalAmount || finalAmount < 0) {
      return {
        success: false,
        message: 'Final amount is required and must be a positive number',
      };
    }

    // Cash payment validation
    if (paymentMethod.toLowerCase() === 'cash') {
      if (!cashAmount || cashAmount <= 0) {
        return {
          success: false,
          message: 'Cash payment requires a valid cash amount',
        };
      }

      const change = cashAmount - finalAmount;

      if (change < 0) {
        return {
          success: false,
          message: 'Cash amount is insufficient',
          change: 0,
        };
      }

      return {
        success: true,
        change,
        message: 'Cash payment validated successfully',
      };
    }

    // For non-cash payments
    return {
      success: true,
      change: 0,
      message: `${paymentMethod} payment validated successfully`,
    };
  }

  static async processTransaction(data: TransactionData) {
    try {
      // Step 1: Validate cart items
      const cartItems = data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        selectedDiscountId: item.discountId,
      }));

      const validatedCartResult = await this.validationCart(cartItems);
      if (!validatedCartResult.success || !validatedCartResult.data) {
        return {
          success: false,
          message: validatedCartResult.message,
        };
      }

      // Step 2: Validate transaction (totals, member, and discount)
      if (data.memberId) {
        const memberCheck = await this.isMemberBanned(data.memberId);
        if (!memberCheck.success) {
          return {
            success: false,
            message: memberCheck.message,
          };
        }
      }

      const validatedTransactionResult = await this.validationTransaction(
        validatedCartResult.data,
        data.memberId,
        data.selectedMemberDiscountId,
        data.selectedTierDiscountId,
        data.globalDiscountCode,
      );

      if (
        !validatedTransactionResult.success ||
        !validatedTransactionResult.data
      ) {
        return {
          success: false,
          message: 'Failed to validate transaction',
        };
      }

      const transactionData = validatedTransactionResult.data;
      const finalAmount = transactionData.finalAmount;

      // Step 3: Validate payment method
      const paymentCheck = await this.checkPaymentMethod(
        data.paymentMethod,
        data.cashAmount,
        finalAmount,
      );

      if (!paymentCheck.success) {
        return {
          success: false,
          message: paymentCheck.message,
        };
      }

      // Step 4: Process transaction in database
      return await this.executeTransaction(
        data,
        validatedCartResult.data,
        transactionData,
        paymentCheck.change || 0,
      );
    } catch (error) {
      console.error('Transaction processing error:', error);
      return errorHandling();
    }
  }

  private static async executeTransaction(
    data: TransactionData,
    validatedCart: ValidatedCartItem[],
    transactionData: TransactionSummary,
    change: number,
  ) {
    // Transform validated items into database format
    const items = this.prepareTransactionItems(validatedCart);

    // Execute database transaction
    return await prisma.$transaction(async (tx) => {
      try {
        // Generate transaction ID
        const tranId = await this.generateTransactionId();

        // Calculate payment amounts
        const paymentAmount =
          data.paymentMethod.toLowerCase() === 'cash'
            ? data.cashAmount || 0
            : transactionData.finalAmount;

        // Create transaction record
        const transaction = await this.createTransactionRecord(
          tx,
          tranId,
          data,
          transactionData,
          paymentAmount,
          change,
          items,
        );

        // Process member points if applicable
        if (data.memberId) {
          await this.processMemberPoints(
            tx,
            data.memberId,
            transaction.id,
            transactionData.subtotal,
            transaction.tranId,
          );
        }

        // First determine which discount ID to track
        let transactionDiscountId = null;
        if (
          transactionData.discountSource === 'global' &&
          transactionData.globalDiscount
        ) {
          transactionDiscountId = transactionData.globalDiscount.id;
        } else if (
          transactionData.discountSource === 'member' ||
          transactionData.discountSource === 'tier'
        ) {
          transactionDiscountId = transactionData.member?.discount?.id;
        }
        // Update inventory
        await this.updateInventory(tx, items);

        // Increment used count for all discounts used in this transaction
        await this.incrementDiscountUsages(
          tx,
          validatedCart,
          transactionDiscountId,
        );

        return {
          success: true,
          data: transaction,
          finalAmount: transactionData.finalAmount,
          cashAmount: data.cashAmount || 0,
          change,
          information: {
            member: data.memberId ? 'Member points processed successfully' : '',
            inventory: 'Inventory updated successfully',
          },
        };
      } catch (error) {
        console.error('Transaction creation error:', error);
        throw error; // Re-throw to trigger transaction rollback
      }
    });
  }

  /**
   * Increment the usage count for all discounts used in the transaction
   */
  // Fix this method signature to accept either approach
  private static async incrementDiscountUsages(
    tx: any,
    validatedCart: ValidatedCartItem[],
    transactionDiscountId: string | null | undefined,
  ) {
    // Get all product discount IDs
    const productDiscountIds = validatedCart
      .filter((item) => item.discount?.id)
      .map((item) => item.discount!.id);

    // Combine with transaction-level discount
    const allDiscountIds = [
      ...new Set([
        ...productDiscountIds,
        ...(transactionDiscountId ? [transactionDiscountId] : []),
      ]),
    ];

    // Increment used count for each discount
    for (const discountId of allDiscountIds) {
      await tx.discount.update({
        where: { id: discountId },
        data: { usedCount: { increment: 1 } },
      });
    }
  }

  private static prepareTransactionItems(validatedCart: ValidatedCartItem[]) {
    return validatedCart.map((item) => ({
      productId: item.productId,
      batchId: item.batchId,
      unitId: item.unitId,
      cost: item.buyPrice,
      quantity: item.quantity,
      discountId: item.discount?.id || null,
      discountValue: item.discount?.value || null,
      discountValueType: item.discount?.valueType || null,
      basicPrice: item.basicPrice,
      subtotal: item.subtotal,
    }));
  }

  private static async createTransactionRecord(
    tx: any,
    tranId: string,
    data: TransactionData,
    transactionData: TransactionSummary,
    paymentAmount: number,
    change: number,
    items: any[],
  ) {
    let discountId = null;
    let discountAmount = null;

    if (
      transactionData.discountSource === 'global' &&
      transactionData.globalDiscount
    ) {
      discountId = transactionData.globalDiscount.id;
      discountAmount = transactionData.globalDiscount.amount;
    } else if (
      (transactionData.discountSource === 'member' ||
        transactionData.discountSource === 'tier') &&
      transactionData.member?.discount
    ) {
      discountId = transactionData.member.discount.id;
      discountAmount = transactionData.member.discount.amount;
    }

    return tx.transaction.create({
      data: {
        tranId,
        cashierId: data.cashierId,
        memberId: transactionData.member?.id || null,
        discountId: discountId,
        discountAmount: discountAmount,
        totalAmount: transactionData.subtotal,
        finalAmount: transactionData.finalAmount,
        paymentMethod: data.paymentMethod,
        paymentAmount,
        change,
        items: {
          create: items.map((item) => ({
            batchId: item.batchId,
            quantity: item.quantity,
            unitId: item.unitId,
            cost: item.cost,
            pricePerUnit: item.basicPrice,
            discountId: item.discountId,
            discountAmount: this.calculateDiscountAmount(
              item.basicPrice,
              item.quantity,
              item.discountValue,
              item.discountValueType,
            ),
            subtotal: item.subtotal,
          })),
        },
      },
    });
  }

  // Helper method to calculate discount amount
  private static calculateDiscountAmount(
    price: number,
    quantity: number,
    discountValue: number | null,
    discountType: string | null,
  ): number | null {
    if (!discountValue || !discountType) return null;

    const totalPrice = price * quantity;
    if (discountType === 'PERCENTAGE') {
      return (discountValue * totalPrice) / 100;
    }
    if (discountType === 'FIXED_AMOUNT') {
      return discountValue * quantity;
    }
    return null;
  }

  private static async processMemberPoints(
    tx: any,
    memberId: string,
    transactionId: string,
    subtotal: number,
    tranId: string,
  ) {
    // Get member data
    const member = await tx.member.findUnique({
      where: { id: memberId },
      include: { tier: true },
    });

    if (!member) return;

    // Calculate points
    const pointsEarned = await calculateMemberPoints(subtotal, member);
    if (pointsEarned <= 0) return;

    // Create points record
    await tx.memberPoint.create({
      data: {
        memberId,
        transactionId,
        pointsEarned,
        dateEarned: new Date(),
        notes: `Points from transaction ${tranId}`,
      },
    });

    // Update member points
    const updatedMember = await tx.member.update({
      where: { id: memberId },
      data: {
        totalPoints: { increment: pointsEarned },
        totalPointsEarned: { increment: pointsEarned },
      },
      include: { tier: true },
    });

    // Check for tier upgrade eligibility
    await this.checkAndUpdateMemberTier(tx, updatedMember);
  }

  private static async checkAndUpdateMemberTier(tx: any, member: any) {
    const eligibleTier = await tx.memberTier.findFirst({
      where: {
        minPoints: { lte: member.totalPointsEarned },
      },
      orderBy: { minPoints: 'desc' },
    });

    if (eligibleTier && (!member.tierId || eligibleTier.id !== member.tierId)) {
      await tx.member.update({
        where: { id: member.id },
        data: { tierId: eligibleTier.id },
      });
    }
  }

  private static async updateInventory(tx: any, items: any[]) {
    for (const item of items) {
      // Get batch information
      const batch = await tx.productBatch.findUnique({
        where: { id: item.batchId },
      });

      if (!batch) {
        throw new Error(`Batch with ID ${item.batchId} not found`);
      }

      // Update batch quantity
      await tx.productBatch.update({
        where: { id: item.batchId },
        data: {
          remainingQuantity: { decrement: item.quantity },
        },
      });

      // Update product stock
      await tx.product.update({
        where: { id: batch.productId },
        data: {
          currentStock: { decrement: item.quantity },
        },
      });
    }
  }

  static async generateTransactionId(): Promise<string> {
    const today = new Date();
    const datePart = format(today, this.DATE_FORMAT);
    const prefix = `${this.STORE_PREFIX}-${datePart}-`;

    // Find latest transaction with this prefix
    const lastTransaction = await prisma.transaction.findFirst({
      where: { tranId: { startsWith: prefix } },
      orderBy: { tranId: 'desc' },
      select: { tranId: true },
    });

    // Calculate next sequence number
    let sequence = 1;
    if (lastTransaction?.tranId) {
      const parts = lastTransaction.tranId.split('-');
      if (parts.length >= 3) {
        const lastSequence = parseInt(parts[2], 10);
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }
    }

    // Format with leading zeros
    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Get paginated transactions with filters and sorting
   */
  static async getPaginated({
    page = 1,
    pageSize = 10,
    sortField = 'createdAt',
    sortDirection = 'desc',
    search = '',
    cashierId,
    memberId,
    paymentMethod,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  }: TransactionPaginationParams) {
    // Build where clause based on filters
    const where: any = {};

    // Add search filter (search in transaction ID or member name)
    if (search) {
      where.OR = [
        { tranId: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
        { member: { name: { contains: search, mode: 'insensitive' } } },
        { cashier: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Add other filters
    if (cashierId) where.cashierId = cashierId;
    if (memberId) where.memberId = memberId;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.finalAmount = {};
      if (minAmount !== undefined) where.finalAmount.gte = minAmount;
      if (maxAmount !== undefined) where.finalAmount.lte = maxAmount;
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Get order by field
    const orderBy: any = {};

    // Handle nested fields
    if (sortField.includes('.')) {
      const [relation, field] = sortField.split('.');
      orderBy[relation] = { [field]: sortDirection };
    } else {
      orderBy[sortField] = sortDirection;
    }

    // Execute query with count
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          cashier: { select: { id: true, name: true } },
          member: { select: { id: true, name: true } },
          items: {
            select: {
              pricePerUnit: true,
              quantity: true,
              discountAmount: true,
              discountId: true,
              discount: true,
            },
          },
          memberPoints: { select: { pointsEarned: true } },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.transaction.count({ where }),
    ]);

    const processedTransactions = transactions.map((transaction) => {
      // Calculate total original amount (before any discounts)
      const originalAmount = transaction.items.reduce(
        (sum, item) => sum + item.pricePerUnit * item.quantity,
        0,
      );

      // Calculate total product discounts
      const productDiscounts = transaction.items.reduce((sum, item) => {
        if (item.discountAmount !== null) {
          return sum + item.discountAmount;
        }
        return sum;
      }, 0);

      // Member discount
      const memberDiscount = transaction.discountAmount || 0;

      return {
        id: transaction.id,
        tranId: transaction.tranId,
        cashier: transaction.cashier,
        member: transaction.member,
        pricing: {
          originalAmount,
          memberDiscount,
          productDiscounts,
          totalDiscount: memberDiscount + productDiscounts,
          finalAmount: transaction.finalAmount,
        },
        payment: {
          method: transaction.paymentMethod,
          amount: transaction.paymentAmount,
          change: transaction.change,
        },
        itemCount: transaction.items.length,
        pointsEarned:
          transaction.memberPoints?.reduce(
            (sum, p) => sum + p.pointsEarned,
            0,
          ) || 0,
        createdAt: transaction.createdAt,
      };
    });

    return {
      transactions: processedTransactions,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        pageSize,
      },
    };
  }

  /**
   * Get transaction by ID with discounts
   * @param id Transaction ID
   * @returns Transaction details with discounts applied
   */

  static async getTransactionById(id: string) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
          cashier: { select: { id: true, name: true, email: true } },
          member: {
            include: {
              tier: true,
              discounts: true,
            },
          },
          items: {
            include: {
              batch: {
                include: {
                  product: {
                    include: {
                      category: true,
                      brand: true,
                      unit: true,
                      discounts: true,
                    },
                  },
                },
              },
              unit: true,
              discount: true,
            },
          },
          memberPoints: true,
          discount: true,
        },
      });

      if (!transaction) {
        return { success: false, message: 'Transaction not found' };
      }

      // Process items and calculate pricing
      let originalAmount = 0;
      let productDiscounts = 0;

      const simplifiedItems = transaction.items.map((item) => {
        const itemTotal = item.pricePerUnit * item.quantity;
        originalAmount += itemTotal;

        // Get discount information directly from the item
        const appliedDiscount = item.discount;

        // Calculate discount amount for item
        let discountAmount = item.discountAmount || 0;
        productDiscounts += discountAmount;

        return {
          id: item.id,
          product: {
            name: item.batch.product.name,
            brand: item.batch.product.brand?.name || null,
            category: item.batch.product.category.name,
            price: item.pricePerUnit,
            unit: item.unit.symbol,
          },
          quantity: item.quantity,
          originalAmount: itemTotal,
          discountApplied: appliedDiscount
            ? {
                id: appliedDiscount.id,
                name: appliedDiscount.name,
                type: appliedDiscount.type,
                value: appliedDiscount.value,
                amount: discountAmount,
                discountedAmount: itemTotal - discountAmount,
              }
            : null,
        };
      });

      // Member data and discount
      const memberData = transaction.member
        ? {
            id: transaction.member.id,
            name: transaction.member.name,
            tier: transaction.member.tier?.name || null,
            pointsEarned: transaction.memberPoints[0]?.pointsEarned || 0,
          }
        : null;

      const memberDiscount = transaction.discount
        ? {
            type: 'member',
            name: transaction.discount.name,
            valueType: transaction.discount.type,
            value: transaction.discount.value,
            amount: transaction.discountAmount || 0,
          }
        : null;

      // Calculate summary
      const totalDiscount = (memberDiscount?.amount || 0) + productDiscounts;
      const finalAmount = originalAmount - totalDiscount;

      // Final response
      return {
        transactionDetails: {
          id: transaction.id,
          tranId: transaction.tranId,
          cashier: transaction.cashier,
          member: memberData,
          pricing: {
            originalAmount,
            discounts: {
              member: memberDiscount,
              products: productDiscounts,
              total: totalDiscount,
            },
            finalAmount,
          },
          payment: {
            method: transaction.paymentMethod,
            amount: transaction.paymentAmount,
            change: transaction.change,
          },
          items: simplifiedItems,
          pointsEarned: transaction.memberPoints[0]?.pointsEarned || 0,
          createdAt: transaction.createdAt,
        },
      };
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      return {
        success: false,
        message: 'Failed to fetch transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Check if member is banned
  static async isMemberBanned(memberId: string) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { isBanned: true, banReason: true },
    });
    if (!member) {
      return { success: false, message: 'Member not found' };
    }
    if (member.isBanned) {
      return {
        success: false,
        message: `Member is banned. Reason: ${
          member.banReason || 'No reason provided'
        }`,
      };
    }
    return { success: true, message: 'Member is not banned' };
  }
}
