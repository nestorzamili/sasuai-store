import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { buildQueryOptions } from '../common/query-options';

export class ProductBatchService {
  /**
   * Get all product batches
   */
  static async getAll(options?: {
    includeProduct?: boolean;
    includeStockMovements?: boolean;
  }) {
    return prisma.productBatch.findMany({
      include: {
        product: options?.includeProduct === true,
        stockIns: options?.includeStockMovements === true,
        stockOuts: options?.includeStockMovements === true,
        transactionItems: options?.includeStockMovements === true,
      },
      orderBy: [
        { expiryDate: 'asc' }, // Show closest expiry dates first
        { createdAt: 'desc' },
      ],
    });
  }
  static async getAllOptimalize(queryOptions?: any) {
    const options = buildQueryOptions(queryOptions);
    const [batch, count] = await Promise.all([
      prisma.productBatch.findMany({
        include: {
          product: true,
        },
        ...options,
      }),
      prisma.productBatch.count(),
    ]);

    return {
      data: batch,
      meta: {
        ...options,
        rowsCount: count,
      },
    };
  }
  /**
   * Get all product batches for a specific product
   */
  static async getAllByProductId(
    productId: string,
    options?: {
      includeStockMovements?: boolean;
    },
  ) {
    return prisma.productBatch.findMany({
      where: { productId },
      include: {
        stockIns: options?.includeStockMovements === true,
        stockOuts: options?.includeStockMovements === true,
        transactionItems: options?.includeStockMovements === true,
      },
      orderBy: [
        { expiryDate: 'asc' }, // Show closest expiry dates first
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Get a product batch by ID
   */
  static async getById(
    id: string,
    options?: {
      includeProduct?: boolean;
      includeStockMovements?: boolean;
      includeProductDetails?: boolean;
    },
  ) {
    return prisma.productBatch.findUnique({
      where: { id },
      include: {
        product:
          options?.includeProduct || options?.includeProductDetails
            ? {
                include: options?.includeProductDetails
                  ? {
                      category: true,
                      unit: true,
                    }
                  : undefined,
              }
            : false,
        stockIns: options?.includeStockMovements
          ? {
              include: {
                unit: true,
                supplier: true,
              },
              orderBy: {
                date: 'desc',
              },
            }
          : false,
        stockOuts: options?.includeStockMovements
          ? {
              include: {
                unit: true,
              },
              orderBy: {
                date: 'desc',
              },
            }
          : false,
        transactionItems: options?.includeStockMovements
          ? {
              include: {
                unit: true,
              },
            }
          : false,
      },
    });
  }

  /**
   * Get a product batch by batch code
   */
  static async getByBatchCode(
    batchCode: string,
    options?: {
      includeProduct?: boolean;
      includeStockMovements?: boolean;
    },
  ) {
    return prisma.productBatch.findFirst({
      where: { batchCode },
      include: {
        product: options?.includeProduct === true,
        stockIns: options?.includeStockMovements === true,
        stockOuts: options?.includeStockMovements === true,
        transactionItems: options?.includeStockMovements === true,
      },
    });
  }

  /**
   * Create a new product batch
   */
  static async create(data: {
    productId: string;
    batchCode: string;
    expiryDate: Date;
    initialQuantity: number;
    buyPrice: number;
    unitId: string;
    supplierId?: string;
  }) {
    // Start a transaction to create the batch and the initial stock-in record
    return prisma.$transaction(async (tx) => {
      // Create the batch with full initial quantity
      const batch = await tx.productBatch.create({
        data: {
          productId: data.productId,
          batchCode: data.batchCode,
          expiryDate: data.expiryDate,
          initialQuantity: data.initialQuantity,
          remainingQuantity: data.initialQuantity, // Initially, remaining = initial
          buyPrice: data.buyPrice,
        },
      });

      // Create a corresponding stock-in record
      const stockIn = await tx.stockIn.create({
        data: {
          batchId: batch.id,
          quantity: data.initialQuantity,
          unitId: data.unitId,
          date: new Date(),
          supplierId: data.supplierId,
        },
      });

      // Update the product's current stock
      await tx.product.update({
        where: { id: data.productId },
        data: {
          currentStock: {
            increment: data.initialQuantity,
          },
        },
      });

      return { batch, stockIn };
    });
  }

  /**
   * Update a product batch
   */
  static async update(
    id: string,
    data: {
      batchCode?: string;
      expiryDate?: Date;
      buyPrice?: number;
    },
  ) {
    return prisma.productBatch.update({
      where: { id },
      data,
    });
  }

  /**
   * Adjust the quantity of a batch (for inventory corrections)
   */
  static async adjustQuantity(
    id: string,
    adjustment: number,
    reason: string,
    unitId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      // Get the current batch
      const batch = await tx.productBatch.findUnique({
        where: { id },
        include: {
          product: true,
        },
      });

      if (!batch) {
        throw new Error('Product batch not found');
      }

      // Calculate new remaining quantity
      const newQuantity = batch.remainingQuantity + adjustment;

      // Ensure quantity doesn't go negative
      if (newQuantity < 0) {
        throw new Error('Quantity adjustment would result in negative stock');
      }

      // Update the batch
      const updatedBatch = await tx.productBatch.update({
        where: { id },
        data: {
          remainingQuantity: newQuantity,
        },
      });

      // Update the product's current stock
      await tx.product.update({
        where: { id: batch.productId },
        data: {
          currentStock: {
            increment: adjustment,
          },
        },
      });

      // Create a stock movement record based on the adjustment direction
      if (adjustment > 0) {
        // Positive adjustment = stock in
        await tx.stockIn.create({
          data: {
            batchId: id,
            quantity: adjustment,
            unitId: unitId,
            date: new Date(),
            supplier: undefined, // No supplier for adjustments
          },
        });
      } else if (adjustment < 0) {
        // Negative adjustment = stock out
        await tx.stockOut.create({
          data: {
            batchId: id,
            quantity: Math.abs(adjustment),
            unitId: unitId,
            date: new Date(),
            reason: reason || 'Inventory adjustment',
          },
        });
      }

      return updatedBatch;
    });
  }

  /**
   * Check if a batch can be safely deleted
   */
  static async canDelete(id: string): Promise<boolean> {
    // Check for any stock movements or transactions
    const [stockIns, stockOuts, transactions] = await Promise.all([
      prisma.stockIn.count({ where: { batchId: id } }),
      prisma.stockOut.count({ where: { batchId: id } }),
      prisma.transactionItem.count({ where: { batchId: id } }),
    ]);

    // Can only delete if there are no transactions and at most 1 stock-in (the initial one)
    return transactions === 0 && stockOuts === 0 && stockIns <= 1;
  }

  /**
   * Delete a product batch (only if it has no transactions)
   */
  static async delete(id: string) {
    // First check if the batch can be deleted
    const canDelete = await this.canDelete(id);

    if (!canDelete) {
      throw new Error(
        'Cannot delete batch with existing stock movements or transactions',
      );
    }

    return prisma.$transaction(async (tx) => {
      // Get the batch details
      const batch = await tx.productBatch.findUnique({
        where: { id },
      });

      if (!batch) {
        throw new Error('Product batch not found');
      }

      // Delete the related stock-in record (should be only one)
      await tx.stockIn.deleteMany({
        where: { batchId: id },
      });

      // Update the product's current stock
      await tx.product.update({
        where: { id: batch.productId },
        data: {
          currentStock: {
            decrement: batch.remainingQuantity,
          },
        },
      });

      // Delete the batch
      return tx.productBatch.delete({
        where: { id },
      });
    });
  }

  /**
   * Get batches that are expiring soon (within the specified days)
   */
  static async getExpiringBatches(daysThreshold: number) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return prisma.productBatch.findMany({
      where: {
        expiryDate: {
          lte: thresholdDate,
        },
        remainingQuantity: {
          gt: 0, // Only include batches that still have stock
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });
  }

  /**
   * Get batches that have already expired
   */
  static async getExpiredBatches() {
    const today = new Date();

    return prisma.productBatch.findMany({
      where: {
        expiryDate: {
          lt: today,
        },
        remainingQuantity: {
          gt: 0, // Only include batches that still have stock
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });
  }

  /**
   * Get batch statistics for a product
   */
  static async getProductBatchStats(productId: string) {
    const today = new Date();

    // Get all batches for the product that have remaining quantity
    const batches = await prisma.productBatch.findMany({
      where: {
        productId,
        remainingQuantity: {
          gt: 0,
        },
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    // Calculate statistics
    const totalBatches = batches.length;
    const totalQuantity = batches.reduce(
      (sum, batch) => sum + batch.remainingQuantity,
      0,
    );
    const expiredBatches = batches.filter(
      (batch) => batch.expiryDate < today,
    ).length;
    const expiredQuantity = batches
      .filter((batch) => batch.expiryDate < today)
      .reduce((sum, batch) => sum + batch.remainingQuantity, 0);

    return {
      totalBatches,
      totalQuantity,
      expiredBatches,
      expiredQuantity,
    };
  }

  /**
   * Get a product batch with detailed product information and stock movements
   */
  static async getWithProductDetails(id: string) {
    return prisma.productBatch.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: true, // Ensure category is loaded
            unit: true, // Ensure unit is loaded
          },
        },
        stockIns: {
          include: {
            unit: true,
            supplier: true, // Ensure supplier is loaded for each stock-in
          },
          orderBy: {
            date: 'desc',
          },
        },
        stockOuts: {
          include: {
            unit: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
        transactionItems: {
          include: {
            transaction: true,
            unit: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }
}
