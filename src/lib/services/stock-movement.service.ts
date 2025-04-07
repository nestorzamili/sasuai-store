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
   * Get all stock-out records including transaction-related stock reductions
   */
  static async getAllStockOuts(options?: {
    includeBatch?: boolean;
    includeUnit?: boolean;
    includeTransactions?: boolean;
  }) {
    // Get manual stock outs
    const manualStockOuts = await prisma.stockOut.findMany({
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
    });

    // If we don't need to include transactions, just return the manual stock outs
    if (options?.includeTransactions === false) {
      return manualStockOuts;
    }

    // Get transaction-related stock reductions
    const transactionItems = await prisma.transactionItem.findMany({
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
        transaction: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    // Convert transaction items to stock out format
    const transactionStockOuts = transactionItems.map((item) => ({
      id: `tr-${item.id}`, // Add prefix to distinguish from manual stock outs
      batchId: item.batchId,
      quantity: item.quantity,
      unitId: item.unitId,
      date: item.transaction.createdAt,
      reason: `Transaction ${item.transaction.id}`,
      createdAt: item.transaction.createdAt,
      updatedAt: item.transaction.createdAt,
      transactionId: item.transaction.id,
      batch: item.batch,
      unit: item.unit,
    }));

    // Combine both manual and transaction-related stock outs
    const allStockOuts = [...manualStockOuts, ...transactionStockOuts];

    // Sort by date (newest first)
    return allStockOuts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
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
   * Get transaction-related stock reductions for a specific batch
   */
  static async getTransactionStockOutsByBatchId(batchId: string) {
    return prisma.transactionItem.findMany({
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
      orderBy: {
        transaction: {
          createdAt: 'desc',
        },
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

    // Get all stock-ins, stock-outs, and transaction items for these batches
    const [stockIns, stockOuts, transactionItems] = await Promise.all([
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
      prisma.transactionItem.findMany({
        where: {
          batchId: { in: batchIds },
        },
        include: {
          batch: true,
          unit: true,
          transaction: {
            select: {
              id: true,
              createdAt: true,
            },
          },
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
        transactionId: null,
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
        transactionId: null,
      })),
      ...transactionItems.map((item) => ({
        id: `tr-${item.id}`,
        date: item.transaction.createdAt,
        type: 'OUT' as const,
        quantity: item.quantity,
        unit: item.unit,
        batchId: item.batchId,
        batchCode: item.batch.batchCode,
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
