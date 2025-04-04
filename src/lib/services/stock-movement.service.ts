import prisma from '@/lib/prisma';

export class StockMovementService {
  /**
   * Get all stock-in records
   */
  static async getAllStockIns(options?: {
    includeBatch?: boolean;
    includeSupplier?: boolean;
    includeUnit?: boolean;
  }) {
    return prisma.stockIn.findMany({
      include: {
        batch:
          options?.includeBatch === true
            ? {
                include: {
                  product: true,
                },
              }
            : false,
        supplier: options?.includeSupplier === true,
        unit: options?.includeUnit === true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  /**
   * Get stock-ins by batch ID
   */
  static async getStockInsByBatchId(batchId: string) {
    return prisma.stockIn.findMany({
      where: {
        batchId,
      },
      include: {
        supplier: true,
        unit: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  /**
   * Get a stock-in record by ID
   */
  static async getStockInById(id: string) {
    return prisma.stockIn.findUnique({
      where: { id },
      include: {
        batch: {
          include: {
            product: true,
          },
        },
        supplier: true,
        unit: true,
      },
    });
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
   * Get all stock-out records
   */
  static async getAllStockOuts(options?: {
    includeBatch?: boolean;
    includeUnit?: boolean;
  }) {
    return prisma.stockOut.findMany({
      include: {
        batch:
          options?.includeBatch === true
            ? {
                include: {
                  product: true,
                },
              }
            : false,
        unit: options?.includeUnit === true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  /**
   * Get stock-outs by batch ID
   */
  static async getStockOutsByBatchId(batchId: string) {
    return prisma.stockOut.findMany({
      where: {
        batchId,
      },
      include: {
        unit: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  /**
   * Get a stock-out record by ID
   */
  static async getStockOutById(id: string) {
    return prisma.stockOut.findUnique({
      where: { id },
      include: {
        batch: {
          include: {
            product: true,
          },
        },
        unit: true,
      },
    });
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
    // Get all stock-ins and stock-outs for the batch
    const [stockIns, stockOuts] = await Promise.all([
      prisma.stockIn.findMany({
        where: { batchId },
        include: {
          supplier: true,
          unit: true,
        },
      }),
      prisma.stockOut.findMany({
        where: { batchId },
        include: {
          unit: true,
        },
      }),
    ]);

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
      })),
      ...stockOuts.map((stockOut) => ({
        id: stockOut.id,
        date: stockOut.date,
        type: 'OUT' as const,
        quantity: stockOut.quantity,
        unit: stockOut.unit,
        supplier: null,
        reason: stockOut.reason,
      })),
    ];

    // Sort by date (newest first)
    return movements.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get the stock movement history for a product
   */
  static async getProductStockMovementHistory(productId: string) {
    // Get all batches for this product
    const batches = await prisma.productBatch.findMany({
      where: { productId },
      select: { id: true },
    });

    const batchIds = batches.map((batch) => batch.id);

    // Get all stock-ins and stock-outs for these batches
    const [stockIns, stockOuts] = await Promise.all([
      prisma.stockIn.findMany({
        where: {
          batchId: { in: batchIds },
        },
        include: {
          batch: true,
          supplier: true,
          unit: true,
        },
      }),
      prisma.stockOut.findMany({
        where: {
          batchId: { in: batchIds },
        },
        include: {
          batch: true,
          unit: true,
        },
      }),
    ]);

    // Combine and sort by date
    const movements = [
      ...stockIns.map((stockIn) => ({
        id: stockIn.id,
        date: stockIn.date,
        type: 'IN' as const,
        quantity: stockIn.quantity,
        unit: stockIn.unit,
        batchId: stockIn.batchId,
        batchCode: stockIn.batch.batchCode,
        supplier: stockIn.supplier,
        reason: null,
      })),
      ...stockOuts.map((stockOut) => ({
        id: stockOut.id,
        date: stockOut.date,
        type: 'OUT' as const,
        quantity: stockOut.quantity,
        unit: stockOut.unit,
        batchId: stockOut.batchId,
        batchCode: stockOut.batch.batchCode,
        supplier: null,
        reason: stockOut.reason,
      })),
    ];

    // Sort by date (newest first)
    return movements.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
