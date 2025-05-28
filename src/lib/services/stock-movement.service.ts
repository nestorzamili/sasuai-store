import prisma from '@/lib/prisma';
import {
  StockMovementSearchParams,
  StockInComplete,
  StockOutComplete,
  CreateStockInData,
  CreateStockOutData,
  StockMovement,
  PaginatedResponse,
  ProductBatchWithProduct,
} from '@/lib/types/inventory';

export class StockMovementService {
  static async getAllStockIns(
    params: StockMovementSearchParams = {},
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
    params: StockMovementSearchParams = {},
  ): Promise<PaginatedResponse<StockOutComplete>> {
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
        orderBy,
        skip,
        take: limit,
      }),
      prisma.stockOut.count({ where }),
    ]);

    return {
      data: data as StockOutComplete[],
      meta: {
        totalRows: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        pageSize: limit,
      },
    };
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
    batchId: string,
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
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }
}
