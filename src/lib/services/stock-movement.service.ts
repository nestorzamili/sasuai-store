import prisma from '@/lib/prisma';

export class StockMovementService {
  static async getAllStockIns(queryBuild?: any) {
    try {
      // Build query options directly instead of using buildQueryOptions
      const options: any = {};

      // Handle pagination
      if (queryBuild?.page && queryBuild?.limit) {
        const page = Number(queryBuild.page) || 1;
        const limit = Number(queryBuild.limit) || 10;
        options.skip = (page - 1) * limit;
        options.take = limit;
      }

      // Handle sorting
      if (queryBuild?.sortBy) {
        const sortField = queryBuild.sortBy;
        const sortDirection = queryBuild.sortDirection?.toLowerCase() || 'desc';

        options.orderBy = { [sortField]: sortDirection };
      } else {
        options.orderBy = { date: 'desc' }; // Default sort
      }

      // Handle search with column filtering
      if (queryBuild?.search && queryBuild.search.trim() !== '') {
        const search = queryBuild.search.trim();
        const columnFilters = queryBuild.columnFilter || [];

        if (columnFilters.length > 0) {
          options.where = {
            OR: columnFilters.map((field: string) => {
              // Handle nested properties (e.g. 'batch.product.name')
              if (field.includes('.')) {
                const parts = field.split('.');
                let filter: any = {};
                let current = filter;

                // Build nested filter structure
                for (let i = 0; i < parts.length - 1; i++) {
                  current[parts[i]] = {};
                  current = current[parts[i]];
                }

                current[parts[parts.length - 1]] = {
                  contains: search,
                  mode: 'insensitive',
                };

                return filter;
              } else {
                return {
                  [field]: {
                    contains: search,
                    mode: 'insensitive',
                  },
                };
              }
            }),
          };
        }
      }

      // Execute the database queries
      const [stockIns, count] = await Promise.all([
        prisma.stockIn.findMany({
          include: {
            batch: {
              include: {
                product: true,
              },
            },
            supplier: true,
            unit: true,
          },
          ...options,
        }),
        prisma.stockIn.count(
          options.where ? { where: options.where } : undefined,
        ),
      ]);

      return {
        data: stockIns,
        meta: {
          ...options,
          rowsCount: count,
        },
      };
    } catch (error) {
      return {
        data: [],
        meta: {
          rowsCount: 0,
        },
      };
    }
  }

  /**
   * Create a new stock-in record
   */
  static async createStockIn(data: {
    batchId: string;
    quantity: number;
    unitId: string;
    date: Date;
    supplierId?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // Get the current batch
      const batch = await tx.productBatch.findUnique({
        where: { id: data.batchId },
        include: {
          product: true,
        },
      });

      if (!batch) {
        throw new Error('Product batch not found');
      }

      // Create the stock-in record
      const stockIn = await tx.stockIn.create({
        data: {
          batchId: data.batchId,
          quantity: data.quantity,
          unitId: data.unitId,
          date: data.date,
          supplierId: data.supplierId,
        },
      });

      // Update the batch's remaining quantity
      await tx.productBatch.update({
        where: { id: data.batchId },
        data: {
          remainingQuantity: {
            increment: data.quantity,
          },
        },
      });

      // Update the product's current stock
      await tx.product.update({
        where: { id: batch.productId },
        data: {
          currentStock: {
            increment: data.quantity,
          },
        },
      });

      return stockIn;
    });
  }

  /**
   * Get optimalized stock-out records with pagination support
   */
  static async getAllStockOuts(queryBuild?: any) {
    try {
      const options: any = {};

      // Handle pagination
      if (queryBuild?.page && queryBuild?.limit) {
        const page = Number(queryBuild.page) || 1;
        const limit = Number(queryBuild.limit) || 10;
        options.skip = (page - 1) * limit;
        options.take = limit;
      }

      // Handle sorting
      if (queryBuild?.sortBy) {
        const sortField = queryBuild.sortBy;
        const sortDirection = queryBuild.sortDirection?.toLowerCase() || 'desc';

        options.orderBy = { [sortField]: sortDirection };
      } else {
        options.orderBy = { date: 'desc' }; // Default sort
      }

      // Handle search with column filtering
      if (queryBuild?.search && queryBuild.search.trim() !== '') {
        const search = queryBuild.search.trim();
        const columnFilters = queryBuild.columnFilter || [];

        if (columnFilters.length > 0) {
          options.where = {
            OR: columnFilters.map((field: string) => {
              // Handle nested properties (e.g. 'batch.product.name')
              if (field.includes('.')) {
                const parts = field.split('.');
                let filter: any = {};
                let current = filter;

                // Build nested filter structure
                for (let i = 0; i < parts.length - 1; i++) {
                  current[parts[i]] = {};
                  current = current[parts[i]];
                }

                current[parts[parts.length - 1]] = {
                  contains: search,
                  mode: 'insensitive',
                };

                return filter;
              } else {
                return {
                  [field]: {
                    contains: search,
                    mode: 'insensitive',
                  },
                };
              }
            }),
          };
        }
      }

      // Get paginated manual stock outs
      const [stockOuts, count] = await Promise.all([
        prisma.stockOut.findMany({
          include: {
            batch: {
              include: {
                product: true,
              },
            },
            unit: true,
          },
          ...options,
        }),
        prisma.stockOut.count(
          options.where ? { where: options.where } : undefined,
        ),
      ]);

      return {
        data: stockOuts,
        meta: {
          ...options,
          rowsCount: count,
        },
      };
    } catch (error) {
      return {
        data: [],
        meta: {
          rowsCount: 0,
        },
      };
    }
  }

  /**
   * Create a new stock-out record
   */
  static async createStockOut(data: {
    batchId: string;
    quantity: number;
    unitId: string;
    date: Date;
    reason: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // Get the current batch
      const batch = await tx.productBatch.findUnique({
        where: { id: data.batchId },
        include: {
          product: true,
        },
      });

      if (!batch) {
        throw new Error('Product batch not found');
      }

      // Validate that there's enough stock in the batch
      if (batch.remainingQuantity < data.quantity) {
        throw new Error('Insufficient quantity in the batch');
      }

      // Create the stock-out record
      const stockOut = await tx.stockOut.create({
        data: {
          batchId: data.batchId,
          quantity: data.quantity,
          unitId: data.unitId,
          date: data.date,
          reason: data.reason,
        },
      });

      // Update the batch's remaining quantity
      await tx.productBatch.update({
        where: { id: data.batchId },
        data: {
          remainingQuantity: {
            decrement: data.quantity,
          },
        },
      });

      // Update the product's current stock
      await tx.product.update({
        where: { id: batch.productId },
        data: {
          currentStock: {
            decrement: data.quantity,
          },
        },
      });

      return stockOut;
    });
  }

  /**
   * Get the stock movement history for a batch
   */
  static async getBatchStockMovementHistory(batchId: string) {
    // Get all stock-ins for the batch
    const stockIns = await prisma.stockIn.findMany({
      where: { batchId },
      include: {
        supplier: true,
        unit: true,
      },
    });

    // Get all manual stock-outs for the batch
    const stockOuts = await prisma.stockOut.findMany({
      where: { batchId },
      include: {
        unit: true,
      },
    });

    // Get transaction items related to the batch
    const transactionItems = await prisma.transactionItem.findMany({
      where: { batchId },
      include: {
        unit: true,
        transaction: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    // Combine and sort by date
    const movements = [
      ...stockIns.map((stockIn) => ({
        id: stockIn.id,
        date: stockIn.date,
        type: 'IN' as const,
        quantity: stockIn.quantity,
        unit: stockIn.unit,
        supplier: stockIn.supplier,
        reason: null,
        transactionId: null,
      })),
      ...stockOuts.map((stockOut) => ({
        id: stockOut.id,
        date: stockOut.date,
        type: 'OUT' as const,
        quantity: stockOut.quantity,
        unit: stockOut.unit,
        supplier: null,
        reason: stockOut.reason,
        transactionId: null,
      })),
      ...transactionItems.map((item) => ({
        id: `tr-${item.id}`,
        date: item.transaction.createdAt,
        type: 'OUT' as const,
        quantity: item.quantity,
        unit: item.unit,
        supplier: null,
        reason: 'Sale',
        transactionId: item.transaction.id,
      })),
    ];

    // Sort by date (newest first)
    return movements.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }
}
