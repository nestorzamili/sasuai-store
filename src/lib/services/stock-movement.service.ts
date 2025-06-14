import prisma from '@/lib/prisma';
import {
  StockMovementSearchParams,
  StockInComplete,
  StockOutComplete,
  UnifiedStockOutComplete,
  CreateStockInData,
  CreateStockOutData,
  StockMovement,
  PaginatedResponse,
  ProductBatchWithProduct,
} from '@/lib/types/inventory';

export class StockMovementService {
  static async getAllStockIns(
    params: StockMovementSearchParams = {}
  ): Promise<PaginatedResponse<StockInComplete>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortDirection = 'desc',
      search = '',
    } = params;

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        {
          batch: {
            product: { name: { contains: search, mode: 'insensitive' } },
          },
        },
        { batch: { batchCode: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderBy: Record<string, unknown> = {};
    if (sortBy.includes('.')) {
      const [relation, field] = sortBy.split('.');
      orderBy[relation] = { [field]: sortDirection };
    } else {
      orderBy[sortBy] = sortDirection;
    }

    const [data, totalCount] = await Promise.all([
      prisma.stockIn.findMany({
        where,
        include: {
          batch: {
            include: {
              product: {
                include: {
                  category: true,
                  unit: true,
                },
              },
            },
          },
          supplier: true,
          unit: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.stockIn.count({ where }),
    ]);

    return {
      data: data as StockInComplete[],
      meta: {
        totalRows: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        pageSize: limit,
      },
    };
  }
  static async getAllStockOuts(
    params: StockMovementSearchParams = {}
  ): Promise<PaginatedResponse<UnifiedStockOutComplete>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortDirection = 'desc',
      search = '',
    } = params;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        {
          batch: {
            product: { name: { contains: search, mode: 'insensitive' } },
          },
        },
        { batch: { batchCode: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Calculate pagination variables
    const pageSize = limit;
    const skip = (page - 1) * pageSize;

    // Fetch efficient counts first to determine pagination strategy
    const [manualCount, transactionCount] = await Promise.all([
      prisma.stockOut.count({ where }),
      prisma.transactionItem.count({ where }),
    ]);

    const totalCount = manualCount + transactionCount;

    // Case 1: Page is within manual stock outs
    if (skip < manualCount) {
      // How many manual records to fetch for this page
      const manualToTake = Math.min(pageSize, manualCount - skip);

      // Calculate how many transaction records we need (if any)
      const transactionToTake = pageSize - manualToTake;
      const transactionSkip = 0; // Always start from the beginning for transaction items when mixed with manual

      // Get data
      const [manualStockOuts, transactionItems] = await Promise.all([
        prisma.stockOut.findMany({
          where,
          include: {
            batch: {
              include: {
                product: {
                  include: {
                    category: true,
                    unit: true,
                  },
                },
              },
            },
            unit: true,
          },
          orderBy: { [sortBy]: sortDirection },
          skip,
          take: manualToTake,
        }),
        // Only fetch transaction items if needed for this page
        transactionToTake > 0
          ? prisma.transactionItem.findMany({
              where,
              include: {
                batch: {
                  include: {
                    product: {
                      include: {
                        category: true,
                        unit: true,
                      },
                    },
                  },
                },
                unit: true,
                transaction: {
                  select: {
                    id: true,
                    tranId: true,
                    createdAt: true,
                  },
                },
              },
              orderBy: { createdAt: sortDirection },
              skip: transactionSkip,
              take: transactionToTake,
            })
          : [],
      ]);

      // Convert to unified format
      const unifiedManualStockOuts: UnifiedStockOutComplete[] =
        manualStockOuts.map((stockOut) => ({
          id: stockOut.id,
          batchId: stockOut.batchId,
          quantity: stockOut.quantity,
          unitId: stockOut.unitId,
          date: stockOut.date,
          reason: stockOut.reason,
          type: 'MANUAL' as const,
          createdAt: stockOut.createdAt,
          updatedAt: stockOut.updatedAt,
          batch: stockOut.batch as ProductBatchWithProduct,
          unit: stockOut.unit,
        }));

      const unifiedTransactionStockOuts: UnifiedStockOutComplete[] =
        transactionItems.map((item) => ({
          id: `transaction_${item.id}`,
          batchId: item.batchId,
          quantity: item.quantity,
          unitId: item.unitId,
          date: item.transaction.createdAt,
          reason: 'TRANSACTION',
          type: 'TRANSACTION' as const,
          transactionId: item.transactionId,
          transactionItemId: item.id,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          batch: item.batch as ProductBatchWithProduct,
          unit: item.unit,
          transaction: {
            id: item.transaction.id,
            tranId: item.transaction.tranId,
            cashier: {
              name: null,
            },
          },
        }));

      // Combine results
      const paginatedData = [
        ...unifiedManualStockOuts,
        ...unifiedTransactionStockOuts,
      ];

      // Sort by date if we have mixed data types
      if (
        unifiedManualStockOuts.length > 0 &&
        unifiedTransactionStockOuts.length > 0
      ) {
        paginatedData.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
        });
      }

      return {
        data: paginatedData,
        meta: {
          totalRows: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
          currentPage: page,
          pageSize,
        },
      };
    }
    // Case 2: Page is beyond manual stock outs, only need transaction records
    else {
      const transactionSkip = skip - manualCount;

      const transactionItems = await prisma.transactionItem.findMany({
        where,
        include: {
          batch: {
            include: {
              product: {
                include: {
                  category: true,
                  unit: true,
                },
              },
            },
          },
          unit: true,
          transaction: {
            select: {
              id: true,
              tranId: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: sortDirection },
        skip: transactionSkip,
        take: pageSize,
      });

      // Convert to unified format
      const paginatedData: UnifiedStockOutComplete[] = transactionItems.map(
        (item) => ({
          id: `transaction_${item.id}`,
          batchId: item.batchId,
          quantity: item.quantity,
          unitId: item.unitId,
          date: item.transaction.createdAt,
          reason: 'TRANSACTION',
          type: 'TRANSACTION' as const,
          transactionId: item.transactionId,
          transactionItemId: item.id,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          batch: item.batch as ProductBatchWithProduct,
          unit: item.unit,
          transaction: {
            id: item.transaction.id,
            tranId: item.transaction.tranId,
            cashier: {
              name: null,
            },
          },
        })
      );

      return {
        data: paginatedData,
        meta: {
          totalRows: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
          currentPage: page,
          pageSize,
        },
      };
    }
  }

  static async createStockIn(data: CreateStockInData) {
    return prisma.$transaction(async (tx) => {
      const stockIn = await tx.stockIn.create({
        data: {
          batchId: data.batchId,
          quantity: data.quantity,
          unitId: data.unitId,
          date: data.date,
          supplierId: data.supplierId,
        },
        include: {
          batch: {
            include: {
              product: {
                include: {
                  category: true,
                  unit: true,
                },
              },
            },
          },
          unit: true,
          supplier: true,
        },
      });

      const batch = await tx.productBatch.update({
        where: { id: data.batchId },
        data: {
          remainingQuantity: { increment: data.quantity },
        },
      });

      await tx.product.update({
        where: { id: batch.productId },
        data: {
          currentStock: { increment: data.quantity },
        },
      });

      return stockIn as StockInComplete;
    });
  }

  static async createStockOut(data: CreateStockOutData) {
    return prisma.$transaction(async (tx) => {
      const batch = await tx.productBatch.findUnique({
        where: { id: data.batchId },
      });

      if (!batch) {
        throw new Error('Product batch not found');
      }

      if (batch.remainingQuantity < data.quantity) {
        throw new Error('Insufficient stock for this operation');
      }

      const stockOut = await tx.stockOut.create({
        data: {
          batchId: data.batchId,
          quantity: data.quantity,
          unitId: data.unitId,
          date: data.date,
          reason: data.reason,
        },
        include: {
          batch: {
            include: {
              product: {
                include: {
                  category: true,
                  unit: true,
                },
              },
            },
          },
          unit: true,
        },
      });

      await tx.productBatch.update({
        where: { id: data.batchId },
        data: {
          remainingQuantity: { decrement: data.quantity },
        },
      });

      await tx.product.update({
        where: { id: batch.productId },
        data: {
          currentStock: { decrement: data.quantity },
        },
      });

      return stockOut as StockOutComplete;
    });
  }

  static async getBatchStockMovementHistory(
    batchId: string
  ): Promise<StockMovement[]> {
    const [stockIns, stockOuts] = await Promise.all([
      prisma.stockIn.findMany({
        where: { batchId },
        include: {
          unit: true,
          supplier: true,
          batch: {
            include: {
              product: {
                include: {
                  category: true,
                  unit: true,
                },
              },
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.stockOut.findMany({
        where: { batchId },
        include: {
          unit: true,
          batch: {
            include: {
              product: {
                include: {
                  category: true,
                  unit: true,
                },
              },
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
    ]);

    const movements: StockMovement[] = [
      ...stockIns.map((item) => ({
        id: item.id,
        date: item.date,
        type: 'IN' as const,
        quantity: item.quantity,
        batchId: item.batchId,
        reason: null,
        supplier: item.supplier,
        unit: item.unit,
        batch: item.batch as ProductBatchWithProduct,
      })),
      ...stockOuts.map((item) => ({
        id: item.id,
        date: item.date,
        type: 'OUT' as const,
        quantity: item.quantity,
        batchId: item.batchId,
        reason: item.reason,
        supplier: null,
        unit: item.unit,
        batch: item.batch as ProductBatchWithProduct,
      })),
    ];

    return movements.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
}
