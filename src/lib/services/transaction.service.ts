import prisma from '@/lib/prisma';
import { TransactionPaginationParams } from '../types/transaction';
import { Prisma } from '@prisma/client';

export class TransactionService {
  /**
   * Get a transaction by ID
   */
  static async getById(id: string) {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        cashier: true,
        member: true,
        items: {
          include: {
            batch: {
              include: {
                product: {
                  include: {
                    category: true,
                    brand: true,
                    unit: true,
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                    },
                  },
                },
              },
            },
            unit: true,
          },
        },
        memberPoints: true,
      },
    });
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
              discountValue: true,
              discountValueType: true,
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
        if (item.discountValue && item.discountValueType) {
          const itemTotal = item.pricePerUnit * item.quantity;
          return item.discountValueType === 'percentage'
            ? sum + Math.round((itemTotal * item.discountValue) / 100)
            : sum + item.discountValue;
        }
        return sum;
      }, 0);

      // Member discount
      const memberDiscount = transaction.discountAmount || 0;

      return {
        id: transaction.id,
        cashier: transaction.cashier,
        member: transaction.member,
        pricing: {
          originalAmount, // Total sebelum diskon
          memberDiscount, // Diskon member
          productDiscounts, // Total diskon produk
          totalDiscount: memberDiscount + productDiscounts, // Total semua diskon
          finalAmount: transaction.finalAmount, // Total setelah diskon
        },
        paymentMethod: transaction.paymentMethod,
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
   * Get transactions for a specific member
   */
  static async getByMember(memberId: string) {
    return prisma.transaction.findMany({
      where: { memberId },
      include: {
        cashier: true,
        items: {
          include: {
            batch: {
              include: {
                product: true,
              },
            },
            unit: true,
          },
        },
        memberPoints: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get transactions by date range
   */
  static async getByDateRange(startDate: Date, endDate: Date) {
    return prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        cashier: true,
        member: true,
        items: {
          include: {
            batch: {
              include: {
                product: true,
              },
            },
            unit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get transaction summary for dashboard
   */
  static async getSummary(days: number = 30) {
    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total transactions and revenue in the period
    const transactionStats = await prisma.$transaction([
      // Total number of transactions
      prisma.transaction.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),
      // Total revenue
      prisma.transaction.aggregate({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _sum: {
          finalAmount: true,
        },
      }),
      // Top selling products
      prisma.transactionItem.groupBy({
        by: ['batchId'],
        where: {
          transaction: {
            createdAt: {
              gte: startDate,
            },
          },
        },
        _sum: {
          quantity: true,
          subtotal: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    // Extract data
    const totalTransactions = transactionStats[0];
    const totalRevenue = transactionStats[1]._sum.finalAmount || 0;
    const topSellingItems = transactionStats[2];

    // Calculate average transaction value
    const averageTransactionValue =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Get product details for top selling items
    const topSellingProducts = await Promise.all(
      topSellingItems.map(async (item) => {
        const batch = await prisma.productBatch.findUnique({
          where: { id: item.batchId },
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return {
          productId: batch?.product.id || '',
          productName: batch?.product.name || 'Unknown Product',
          quantity: item._sum?.quantity || 0,
          revenue: item._sum?.subtotal || 0,
        };
      }),
    );

    return {
      totalTransactions,
      totalRevenue,
      averageTransactionValue,
      topSellingProducts,
    };
  }

  /**
   * Void a transaction (cancel it)
   * This will revert the stock changes and member points
   */
  static async voidTransaction(id: string, reason: string) {
    return prisma.$transaction(async (tx) => {
      // Get the transaction with items
      const transaction = await tx.transaction.findUnique({
        where: { id },
        include: {
          items: true,
          memberPoints: true,
        },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Restore stock for each item
      for (const item of transaction.items) {
        // Get the batch
        const batch = await tx.productBatch.findUnique({
          where: { id: item.batchId },
          select: { productId: true },
        });

        if (batch) {
          // Restore batch quantity
          await tx.productBatch.update({
            where: { id: item.batchId },
            data: {
              remainingQuantity: {
                increment: item.quantity,
              },
            },
          });

          // Restore product stock
          await tx.product.update({
            where: { id: batch.productId },
            data: {
              currentStock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      // If there are member points, remove them
      if (transaction.memberPoints.length > 0 && transaction.memberId) {
        let totalPointsDeducted = 0;

        // Get member before changes
        const memberBefore = await tx.member.findUnique({
          where: { id: transaction.memberId },
          include: { tier: true },
        });

        // Calculate total points to deduct and delete point records
        for (const point of transaction.memberPoints) {
          totalPointsDeducted += point.pointsEarned;

          // Delete the member point record
          await tx.memberPoint.delete({
            where: { id: point.id },
          });
        }

        // Update member's total points in a single operation
        const updatedMember = await tx.member.update({
          where: { id: transaction.memberId },
          data: {
            totalPoints: { decrement: totalPointsDeducted },
            totalPointsEarned: { decrement: totalPointsDeducted },
          },
          include: { tier: true },
        });

        // Get ALL tiers
        const allTiers = await tx.memberTier.findMany({
          orderBy: { minPoints: 'asc' },
        });

        // Sort tiers by minPoints in descending order
        const sortedTiers = [...allTiers].sort(
          (a, b) => b.minPoints - a.minPoints,
        );

        // Find the appropriate tier based on current points
        let eligibleTier = sortedTiers.find(
          (tier) => updatedMember.totalPointsEarned >= tier.minPoints,
        );

        // If no eligible tier found (rare case), use the lowest tier
        if (!eligibleTier && allTiers.length > 0) {
          eligibleTier = allTiers[0]; // Lowest tier
        }

        // Update member tier if eligible tier is different from current tier
        if (eligibleTier && eligibleTier.id !== updatedMember.tierId) {
          await tx.member.update({
            where: { id: transaction.memberId },
            data: { tierId: eligibleTier.id },
          });
        }
      }

      // Delete transaction items
      await tx.transactionItem.deleteMany({
        where: { transactionId: id },
      });

      // Delete the transaction
      await tx.transaction.delete({
        where: { id },
      });

      // Create a record of this in the expense table as a void transaction
      await tx.expense.create({
        data: {
          amount: transaction.finalAmount,
          category: 'Voided Transaction',
          description: `Void transaction #${transaction.id}: ${reason}`,
          date: new Date(),
        },
      });

      return { success: true, message: 'Transaction successfully voided' };
    });
  }

  /**
   * Get available product batches for transactions
   * Returns batches that have remaining quantity greater than 0
   * with product and unit information
   */
  static async getAvailableProductBatches(search: string = '') {
    // Build search condition
    const baseCondition: Prisma.ProductBatchWhereInput = {
      remainingQuantity: { gt: 0 },
      expiryDate: { gt: new Date() }, // Only non-expired batches
    };

    // Add search condition if search string is provided
    let whereCondition: Prisma.ProductBatchWhereInput = baseCondition;

    if (search) {
      whereCondition = {
        ...baseCondition,
        OR: [
          {
            product: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
          {
            batchCode: { contains: search, mode: 'insensitive' },
          },
          {
            product: {
              barcode: { contains: search, mode: 'insensitive' },
            },
          },
        ],
      };
    }

    // Fetch product batches with their related product and unit information
    const batches = await prisma.productBatch.findMany({
      where: whereCondition,
      include: {
        product: {
          include: {
            category: true,
            unit: true,
          },
        },
      },
      orderBy: [
        // Order by product name, then expiry date (closest first)
        { product: { name: 'asc' } },
        { expiryDate: 'asc' },
      ],
    });

    // Map the results to include unit information from the product's unit
    return batches.map((batch) => ({
      ...batch,
      availableQuantity: batch.remainingQuantity,
      unit: batch.product.unit, // Use the unit from the product
    }));
  }

  /**
   * Check if a discount is available for a member or product
   * @param params Object containing discount check parameters
   * @param params.memberId Optional member ID to check for member-specific discounts
   * @param params.productId Optional product ID to check for product-specific discounts
   * @param params.subAmount Optional subtotal amount for minimum purchase checks
   * @returns Discount availability information and applicable discounts
   */
  static async checkIsReadyForDiscount({
    memberId,
    productId,
    subAmount,
  }: {
    memberId?: string | null;
    productId?: string | null;
    subAmount: number | null;
  }) {
    // Base query for discount
    let whereQuery: any = {
      isActive: true,
    };

    // If neither memberId nor productId is provided, return no discount available
    if (!memberId && !productId) {
      return {
        isDiscountAvailable: false,
        discount: null,
      };
    }

    // Configure where query based on whether we're checking for member or product discount
    if (memberId) {
      whereQuery.discountMembers = {
        some: {
          memberId: memberId,
        },
      };
    } else if (productId) {
      whereQuery.discountRelationProduct = {
        some: {
          productId: productId,
        },
      };
    }

    // Fetch applicable discounts
    const discounts = await prisma.discount.findMany({
      where: whereQuery,
    });

    // Check if there are any discounts available
    if (!discounts || discounts.length === 0) {
      return {
        isDiscountAvailable: false,
        discount: null,
      };
    }

    // Filter discounts based on minimum purchase amount if applicable
    const applicableDiscounts = discounts.filter(
      (discount) =>
        !discount.minPurchase ||
        (subAmount !== null &&
          subAmount !== undefined &&
          subAmount >= discount.minPurchase),
    );

    // Get the best discount (highest value)
    const bestDiscounts = applicableDiscounts
      .map((discount) => {
        let calculatedValue = 0;

        if (discount.valueType === 'percentage' && subAmount) {
          calculatedValue = (discount.value / 100) * subAmount;
        } else if (discount.valueType === 'flat') {
          calculatedValue = discount.value;
        }

        return {
          ...discount,
          calculatedValue,
        };
      })
      .sort((a, b) => b.calculatedValue - a.calculatedValue);

    return {
      isDiscountAvailable: applicableDiscounts.length > 0,
      allDiscountTotal: discounts.length || 0,
      availableDiscountTotal: applicableDiscounts.length || 0,
      discount: applicableDiscounts.map((discount) => ({
        discountId: discount.id,
        discountName: discount.name,
        discountValueType: discount.valueType,
        discountValue: discount.value,
        minPurchase: discount.minPurchase,
      })),
      bestDiscount: bestDiscounts.length > 0 ? bestDiscounts[0] : null,
    };
  }

  /**
   * Calculate discount amount based on type and value
   * @param type Discount type: 'percentage' or 'flat'
   * @param value Discount value
   * @param amount Total amount to apply discount to (required for percentage)
   */
  static calculateDiscount({
    type,
    value,
    amount,
  }: {
    type: 'percentage' | 'flat';
    value: number;
    amount?: number;
  }) {
    if (type === 'percentage' && amount !== undefined) {
      return (value / 100) * amount;
    } else if (type === 'flat') {
      return value;
    }
    return 0;
  }
  static async isMember(id: string) {
    try {
      const member = await prisma.member.findUnique({
        where: { id },
      });
      return member?.id;
    } catch (error) {
      throw new Error(`Member with ID ${id} not found`);
    }
  }
  static async isDiscountValid(id: string) {
    try {
      const discount = await prisma.discount.findFirst({
        where: {
          id: id,
          isActive: true,
        },
      });
      return {
        discountId: discount?.id,
        discountValue: discount?.value,
        discountValueType: discount?.valueType,
      };
    } catch (error) {
      console.error('Error checking discount:', error);
      return {};
    }
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
              discountRelationsMember: { include: { discount: true } },
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
                      discountRelationProduct: { include: { discount: true } },
                    },
                  },
                },
              },
              unit: true,
            },
          },
          memberPoints: true,
        },
      });

      if (!transaction) {
        return { success: false, message: 'Transaction not found' };
      }

      // Get all discount details
      const discountIds = [
        ...(transaction.discountMemberId ? [transaction.discountMemberId] : []),
        ...(transaction.items
          .map((item) => item.discountId)
          .filter(Boolean) as string[]),
      ];

      const discounts =
        discountIds.length > 0
          ? await prisma.discount.findMany({
              where: { id: { in: discountIds } },
            })
          : [];

      const discountMap = new Map(discounts.map((d) => [d.id, d]));

      // Process items and calculate pricing
      let originalAmount = 0;
      let productDiscounts = 0;

      const simplifiedItems = transaction.items.map((item) => {
        const itemTotal = item.pricePerUnit * item.quantity;
        originalAmount += itemTotal;

        const appliedDiscount = item.discountId
          ? discountMap.get(item.discountId)
          : null;

        // Calculate discount amount for item
        let discountAmount = 0;
        if (appliedDiscount && item.discountValueType && item.discountValue) {
          if (item.discountValueType === 'percentage') {
            discountAmount = Math.round((itemTotal * item.discountValue) / 100);
          } else if (item.discountValueType === 'flat') {
            discountAmount = item.discountValue * item.quantity;
          }
        }
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
                type: appliedDiscount.discountType,
                valueType: item.discountValueType,
                value: item.discountValue,
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

      const memberDiscount = transaction.discountMemberId
        ? {
            type: 'member',
            name:
              discountMap.get(transaction.discountMemberId)?.name || 'Unknown',
            valueType: transaction.discountValueType,
            value: transaction.discountValue,
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
          paymentMethod: transaction.paymentMethod,
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
}
