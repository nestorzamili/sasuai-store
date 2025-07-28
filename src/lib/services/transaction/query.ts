import prisma from '@/lib/prisma';
import { errorHandling } from '@/lib/common/response-formatter';
import type {
  TransactionPaginationParams,
  TransactionPaginationResult,
  TransactionWhereInput,
  ProcessedTransaction,
} from './types';

/**
 * Transaction Query Service - Handles retrieving transaction data
 */
export class Query {
  /**
   * Get paginated transactions with filters and sorting
   */
  static async getPaginated(
    params: TransactionPaginationParams,
  ): Promise<TransactionPaginationResult> {
    try {
      const {
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
      } = params;

      // Build where clause based on filters
      const where: TransactionWhereInput = {};

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
      const orderBy:
        | Record<string, 'asc' | 'desc'>
        | Record<string, Record<string, 'asc' | 'desc'>> = {};

      // Handle nested fields
      if (sortField.includes('.')) {
        const [relation, field] = sortField.split('.');
        orderBy[relation] = { [field]: sortDirection };
      } else {
        orderBy[sortField] = sortDirection;
      }

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
          // Calculate pricing details
          const originalAmount = transaction.totalAmount;
          const memberDiscount = transaction.discountAmount || 0;

          // Calculate product discounts from items
          const productDiscounts = transaction.items.reduce((sum, item) => {
            return sum + (item.discountAmount || 0);
          }, 0);

          const totalDiscount = memberDiscount + productDiscounts;
          const finalAmount = transaction.finalAmount;

          // Calculate points earned
          const pointsEarned = transaction.memberPoints.reduce((sum, point) => {
            return sum + point.pointsEarned;
          }, 0);

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
              finalAmount,
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
        transactions: processedTransactions,
        pagination: {
          totalCount,
          totalPages,
          currentPage: page,
          pageSize,
        },
      };
    } catch (error) {
      console.error('Error getting paginated transactions:', error);
      throw errorHandling();
    }
  }

  /**
   * Get transaction by ID with full details
   */
  static async getById(transactionId: string) {
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

      // Calculate product discounts
      const productDiscounts = transaction.items.reduce((sum, item) => {
        return sum + (item.discountAmount || 0);
      }, 0);

      const totalDiscounts = memberDiscountAmount + productDiscounts;
      const pointsEarned = transaction.memberPoints.reduce((sum, point) => {
        return sum + point.pointsEarned;
      }, 0);

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
            member: transaction.discount
              ? {
                  type: transaction.discount.type,
                  name: transaction.discount.name,
                  valueType: transaction.discount.type,
                  value: transaction.discount.value,
                  amount: memberDiscountAmount,
                }
              : null,
            products: productDiscounts,
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
        transactionDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
