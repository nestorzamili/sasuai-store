import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type {
  TransactionQueryParams,
  ProcessedTransaction,
  ApiResponse,
  TransactionListData,
  TransactionDetails,
} from './types';

/**
 * Transaction Service - Handles retrieving transaction data
 */
export class GetTransaction {
  /**
   * Calculate discount totals from transaction items
   */
  private static calculateDiscounts(
    items: { discountAmount?: number | null }[],
  ) {
    return items.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
  }

  /**
   * Calculate points earned from member points
   */
  private static calculatePoints(memberPoints: { pointsEarned: number }[]) {
    return memberPoints.reduce((sum, point) => sum + point.pointsEarned, 0);
  }

  /**
   * Get transactions with filters and sorting
   */
  static async getTransactions(
    params: TransactionQueryParams,
  ): Promise<ApiResponse<TransactionListData>> {
    try {
      // Build where clause directly
      const where: Prisma.TransactionWhereInput = {
        ...(params.cashierId && { cashierId: params.cashierId }),
        ...(params.memberId && { memberId: params.memberId }),
        ...(params.paymentMethod && { paymentMethod: params.paymentMethod }),
        ...(params.search && {
          OR: [
            { tranId: { contains: params.search, mode: 'insensitive' } },
            { id: { contains: params.search, mode: 'insensitive' } },
            {
              member: {
                name: { contains: params.search, mode: 'insensitive' },
              },
            },
            {
              cashier: {
                name: { contains: params.search, mode: 'insensitive' },
              },
            },
          ],
        }),
        ...((params.startDate || params.endDate) && {
          createdAt: {
            ...(params.startDate && { gte: params.startDate }),
            ...(params.endDate && { lte: params.endDate }),
          },
        }),
        ...((params.minAmount !== undefined ||
          params.maxAmount !== undefined) && {
          finalAmount: {
            ...(params.minAmount !== undefined && { gte: params.minAmount }),
            ...(params.maxAmount !== undefined && { lte: params.maxAmount }),
          },
        }),
      };

      // Calculate pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const skip = (page - 1) * pageSize;

      // Build order by directly
      const sortField = params.sortField || 'createdAt';
      const sortDirection = params.sortDirection || 'desc';
      const orderBy: Prisma.TransactionOrderByWithRelationInput =
        sortField.includes('.')
          ? (() => {
              const [relation, field] = sortField.split('.');
              return { [relation]: { [field]: sortDirection } };
            })()
          : { [sortField]: sortDirection };

      // Execute queries in parallel
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

      // Process transactions data
      const processedTransactions: ProcessedTransaction[] = transactions.map(
        (transaction) => {
          const originalAmount = transaction.totalAmount;
          const memberDiscount = transaction.discountAmount || 0;
          const productDiscounts = this.calculateDiscounts(transaction.items);
          const totalDiscount = memberDiscount + productDiscounts;
          const pointsEarned = this.calculatePoints(transaction.memberPoints);

          return {
            id: transaction.id,
            tranId: transaction.tranId,
            cashier: transaction.cashier,
            member: transaction.member,
            pricing: {
              originalAmount,
              memberDiscount,
              productDiscounts,
              totalDiscount,
              finalAmount: transaction.finalAmount,
            },
            payment: {
              method: transaction.paymentMethod,
              amount: transaction.paymentAmount,
              change: transaction.change,
            },
            itemCount: transaction.items.length,
            pointsEarned,
            createdAt: transaction.createdAt,
          };
        },
      );

      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        success: true,
        data: {
          transactions: processedTransactions,
          pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            pageSize,
          },
        },
      };
    } catch (error) {
      console.error('Error getting transactions:', error);
      return {
        success: false,
        message: 'Failed to retrieve transactions',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get transaction details by ID
   */
  static async getTransactionDetail(
    transactionId: string,
  ): Promise<ApiResponse<TransactionDetails>> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
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
        return {
          success: false,
          message: 'Transaction not found',
        };
      }

      // Process transaction details
      const originalAmount = transaction.totalAmount;
      const memberDiscountAmount = transaction.discountAmount || 0;
      const productDiscounts = this.calculateDiscounts(transaction.items);
      const totalDiscounts = memberDiscountAmount + productDiscounts;
      const pointsEarned = this.calculatePoints(transaction.memberPoints);

      // Process items
      const processedItems = transaction.items.map((item) => ({
        id: item.id,
        product: {
          name: item.batch.product.name,
          brand: item.batch.product.brand?.name || null,
          category: item.batch.product.category.name,
          price: item.pricePerUnit,
          unit: item.unit.symbol,
        },
        quantity: item.quantity,
        originalAmount: item.pricePerUnit * item.quantity,
        discountApplied: item.discount
          ? {
              id: item.discount.id,
              name: item.discount.name,
              type: item.discount.type,
              value: item.discount.value,
              amount: item.discountAmount || 0,
              discountedAmount:
                item.pricePerUnit * item.quantity - (item.discountAmount || 0),
            }
          : null,
      }));

      const transactionDetails = {
        id: transaction.id,
        tranId: transaction.tranId,
        createdAt: transaction.createdAt,
        cashier: transaction.cashier,
        member: transaction.member
          ? {
              id: transaction.member.id,
              name: transaction.member.name,
              tier: transaction.member.tier?.name || null,
              pointsEarned,
            }
          : null,
        pricing: {
          originalAmount,
          discounts: {
            // Transaction-level discount (if any)
            ...(transaction.discount && {
              id: transaction.discount.id,
              type: transaction.discount.type,
              name: transaction.discount.name,
              ...(transaction.discount.code && {
                code: transaction.discount.code,
              }),
              valueType: transaction.discount.type,
              value: transaction.discount.value,
              amount: memberDiscountAmount,
              isGlobal: transaction.discount.isGlobal,
              applyTo: transaction.discount.applyTo,
            }),
            // Total discount amount across all sources (transaction + product discounts)
            total: totalDiscounts,
          },
          finalAmount: transaction.finalAmount,
        },
        payment: {
          method: transaction.paymentMethod,
          amount: transaction.paymentAmount,
          change: transaction.change,
        },
        items: processedItems,
        pointsEarned,
      };

      return {
        success: true,
        data: transactionDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve transaction details',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
