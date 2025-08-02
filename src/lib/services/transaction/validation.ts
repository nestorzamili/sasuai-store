import prisma from '@/lib/prisma';
import type { DiscountType } from '@prisma/client';
import type {
  Cart,
  ValidatedCartItem,
  ValidationResult,
  TransactionSummary,
  MemberInfoForValidation,
  DiscountInfo,
  GlobalDiscountInfo,
  MemberBanCheckResult,
  PaymentValidationResult,
  ProductWithRelations,
  AppliedDiscount,
} from './types';
import { Discount } from './discount';
import { MemberService, type MemberData } from './member';

export class Validation {
  // =====================
  // CART VALIDATION
  // =====================

  /**
   * Validates cart items and returns validated cart data
   */
  static async validateCart(
    data: Cart,
  ): Promise<ValidationResult<ValidatedCartItem[]>> {
    // Extract product IDs for efficient batch query
    const productIds = data.map((item) => item.productId);

    // Fetch all required product data in a single query
    const products = (await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        batches: true,
        unit: true,
        discounts: true,
      },
    })) as ProductWithRelations[];

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
      let selectedDiscount: AppliedDiscount | null = null;
      const now = new Date();

      if (cartItem.selectedDiscountId) {
        const discount = product.discounts.find(
          (discount) =>
            discount.id === cartItem.selectedDiscountId &&
            discount.isActive &&
            now >= discount.startDate &&
            now <= discount.endDate &&
            (!discount.maxUses || discount.usedCount < discount.maxUses),
        );

        if (cartItem.selectedDiscountId && !discount) {
          errors.push(
            `Selected discount for product ${product.id} is not valid or has reached usage limit`,
          );
          continue;
        }

        if (discount) {
          selectedDiscount = {
            id: discount.id,
            value: discount.value,
            type: discount.type,
          };
        }
      }
      // We're not auto-selecting any discount when none is chosen

      // Calculate final price and subtotal
      const basicPrice = product.price;
      let discountValue = 0;
      let discountType: string | null = null;

      if (selectedDiscount) {
        discountValue = selectedDiscount.value;
        discountType = selectedDiscount.type;
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
              valueType: selectedDiscount.type as DiscountType,
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

  // =====================
  // TRANSACTION VALIDATION
  // =====================

  /**
   * Validates transaction totals, member, and discounts
   */
  static async validateTransaction(
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

    // Get member data with all relations if applicable (single fetch)
    let memberData: MemberData | null = null;
    let memberInfo: MemberInfoForValidation | null = null;

    if (memberId) {
      memberData = await MemberService.getWithRelations(memberId);
      if (memberData) {
        memberInfo = MemberService.extractTransactionInfo(memberData);
      }
    }

    // Process discounts based on what was sent from frontend
    let appliedDiscount: DiscountInfo | GlobalDiscountInfo | null = null;
    let discountSource: 'global' | 'member' | 'tier' | null = null;

    // 1. If global discount code provided, validate and apply it
    if (globalDiscountCode) {
      const globalDiscount = await Discount.getGlobalDiscountInfo(
        globalDiscountCode,
        subtotal,
      );
      if (globalDiscount) {
        appliedDiscount = globalDiscount;
        discountSource = 'global';
      }
    }
    // 2. If member discount ID provided, validate and apply it
    else if (memberData && selectedMemberDiscountId) {
      const memberDiscount = await Discount.getMemberDiscountInfo(
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
    else if (memberData && selectedTierDiscountId && memberInfo?.tierId) {
      const tierDiscount = await Discount.getTierDiscountInfo(
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
                  ? (appliedDiscount as DiscountInfo)
                  : null,
            }
          : null,
        globalDiscount:
          discountSource === 'global'
            ? (appliedDiscount as GlobalDiscountInfo)
            : null,
        discountSource,
        finalAmount,
      },
    };
  }

  // =====================
  // MEMBER VALIDATION
  // =====================

  /**
   * Check if member is banned
   */
  static async validateMemberStatus(
    memberId: string,
  ): Promise<MemberBanCheckResult> {
    const member = await MemberService.getWithRelations(memberId);
    const validation = MemberService.validateForTransaction(member);

    return {
      success: validation.isValid,
      message: validation.reason || 'Member is not banned',
    };
  }

  /**
   * Check if member is banned using already fetched member data (optimized)
   */
  static validateMemberStatusFromData(
    member: MemberData | null,
  ): MemberBanCheckResult {
    const validation = MemberService.validateForTransaction(member);

    return {
      success: validation.isValid,
      message: validation.reason || 'Member is not banned',
    };
  }

  // =====================
  // PAYMENT VALIDATION
  // =====================

  /**
   * Validates payment method and amounts
   */
  static async validatePayment(
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

  // =====================
  // HELPER METHODS
  // =====================

  /**
   * Calculates discounted price based on discount type and value
   */
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
}
