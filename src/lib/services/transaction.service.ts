import prisma from '@/lib/prisma';
import {
  CreateTransactionData,
  TransactionPaginationParams,
} from '../types/transaction';
import { Prisma } from '@prisma/client';
import { calculateMemberPoints } from './setting.service';
import { MemberService } from './member.service';

export class TransactionService {
  /**
   * Get all transactions
   */
  static async getAll() {
    return prisma.transaction.findMany({
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
                  },
                },
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
   * Create a new transaction
   */
  static async create(data: CreateTransactionData) {
    // Start a transaction
    return await prisma.$transaction(async (tx) => {
      // Create the transaction record
      const transaction = await tx.transaction.create({
        data: {
          cashierId: data.cashierId,
          memberId: data.memberId || null,
          totalAmount: data.totalAmount,
          discountAmount: data.discountAmount,
          finalAmount: data.finalAmount,
          paymentMethod: data.paymentMethod,
          items: {
            create: data.items.map((item) => ({
              batchId: item.batchId,
              quantity: item.quantity,
              unitId: item.unitId,
              pricePerUnit: item.pricePerUnit,
              subtotal: item.subtotal,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Process member points if member is provided
      if (data.memberId) {
        // Get the member
        const member = await tx.member.findUnique({
          where: { id: data.memberId },
          include: { tier: true },
        });

        if (member) {
          // Calculate points based on settings and tier multiplier
          const pointsEarned = await calculateMemberPoints(
            data.finalAmount,
            member,
          );

          if (pointsEarned > 0) {
            // Award points and create point history
            await tx.memberPoint.create({
              data: {
                memberId: data.memberId,
                transactionId: transaction.id,
                pointsEarned,
                dateEarned: new Date(),
                notes: `Points from transaction ${transaction.id}`,
              },
            });

            // Update member's total points
            await tx.member.update({
              where: { id: data.memberId },
              data: {
                totalPoints: { increment: pointsEarned },
                totalPointsEarned: { increment: pointsEarned },
              },
            });
          }
        }
      }

      // Update product inventory for each item
      for (const item of data.items) {
        // Get the current batch
        const batch = await tx.productBatch.findUnique({
          where: { id: item.batchId },
        });

        if (!batch) {
          throw new Error(`Batch with ID ${item.batchId} not found`);
        }

        // Update the batch's remaining quantity
        await tx.productBatch.update({
          where: { id: item.batchId },
          data: {
            remainingQuantity: { decrement: item.quantity },
          },
        });

        // Update the product's current stock
        await tx.product.update({
          where: { id: batch.productId },
          data: {
            currentStock: { decrement: item.quantity },
          },
        });
      }

      // Return the created transaction
      return transaction;
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
          cashier: {
            select: {
              name: true,
            },
          },
          member: {
            select: {
              name: true,
            },
          },
          items: {
            select: {
              id: true,
            },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.transaction.count({ where }),
    ]);

    // Process transaction data to include formatted fields
    const processedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      cashierName: transaction.cashier?.name || 'Unknown',
      memberName: transaction.member?.name || null,
      totalAmount: transaction.totalAmount,
      discountAmount: transaction.discountAmount,
      finalAmount: transaction.finalAmount,
      paymentMethod: transaction.paymentMethod,
      itemCount: transaction.items.length,
      createdAt: transaction.createdAt,
    }));

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      transactions: processedTransactions,
      totalCount,
      totalPages,
      currentPage: page,
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
      if (transaction.memberPoints.length > 0) {
        for (const point of transaction.memberPoints) {
          // Delete the member point record
          await tx.memberPoint.delete({
            where: { id: point.id },
          });

          // Update member's total points
          if (transaction.memberId) {
            await tx.member.update({
              where: { id: transaction.memberId },
              data: {
                totalPoints: {
                  decrement: point.pointsEarned,
                },
              },
            });
          }
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
}
