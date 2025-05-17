import prisma from '@/lib/prisma';
import {
  BatchPaginationParams,
  ProductBatchWithDetails,
} from '@/lib/types/product-batch';

export class ProductBatchService {
  static async getPaginated({
    page = 1,
    pageSize = 10,
    sortField = 'createdAt',
    sortDirection = 'desc',
    search = '',
    productId,
    expiryDateStart,
    expiryDateEnd,
    minRemainingQuantity,
    maxRemainingQuantity,
    includeExpired = true,
    includeOutOfStock = true,
    categoryId,
  }: BatchPaginationParams = {}) {
    // Build where clause based on filters
    const where: any = {};

    // Add search filter across multiple fields
    if (search) {
      where.OR = [
        { batchCode: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { product: { skuCode: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Add product filter
    if (productId) {
      where.productId = productId;
    }

    // Add category filter
    if (categoryId) {
      where.product = {
        ...where.product,
        categoryId: categoryId,
      };
    }

    // Handle expiry date range
    if (expiryDateStart || expiryDateEnd) {
      where.expiryDate = {};
      if (expiryDateStart) where.expiryDate.gte = expiryDateStart;
      if (expiryDateEnd) where.expiryDate.lte = expiryDateEnd;
    }

    // Filter expired items
    if (!includeExpired) {
      where.expiryDate = {
        ...where.expiryDate,
        gt: new Date(),
      };
    }

    // Handle quantity range
    if (
      minRemainingQuantity !== undefined ||
      maxRemainingQuantity !== undefined
    ) {
      where.remainingQuantity = {};
      if (minRemainingQuantity !== undefined) {
        where.remainingQuantity.gte = minRemainingQuantity;
      }
      if (maxRemainingQuantity !== undefined) {
        where.remainingQuantity.lte = maxRemainingQuantity;
      }
    }

    // Filter out of stock items
    if (!includeOutOfStock) {
      where.remainingQuantity = {
        ...where.remainingQuantity,
        gt: 0,
      };
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Build order by
    const orderBy: any = {};

    // Handle nested fields for sorting
    if (sortField.includes('.')) {
      const [relation, field] = sortField.split('.');
      orderBy[relation] = { [field]: sortDirection };
    } else {
      orderBy[sortField] = sortDirection;
    }

    // Execute query with count - HEAVILY optimized to fetch only what's needed
    const [batches, totalCount] = await Promise.all([
      prisma.productBatch.findMany({
        where,
        select: {
          id: true,
          batchCode: true,
          expiryDate: true,
          initialQuantity: true, // Needed for delete operation validation
          remainingQuantity: true,
          buyPrice: true,
          productId: true, // Needed for linking
          product: {
            select: {
              name: true, // Only need name for display
              unitId: true, // Needed for edit operation
            },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.productBatch.count({ where }),
    ]);

    return {
      data: batches,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        pageSize,
      },
    };
  }

  // Get detailed batch record for single batch view - with fixed return type
  static async getById(id: string): Promise<ProductBatchWithDetails | null> {
    try {
      const includeOptions = {
        // Always include product with its details as required by ProductBatchWithDetails
        product: {
          include: {
            category: true,
            unit: true,
          },
        },

        // Always include these as they're required by ProductBatchWithDetails interface
        stockIns: {
          include: {
            supplier: true,
            unit: true,
          },
        },

        stockOuts: {
          include: {
            unit: true,
          },
        },

        transactionItems: {
          include: {
            unit: true,
            transaction: {
              select: {
                id: true,
                createdAt: true,
                finalAmount: true,
              },
            },
          },
        },
      };

      const result = await prisma.productBatch.findUnique({
        where: { id },
        include: includeOptions,
      });

      // If no result, return null
      if (!result) return null;

      // Ensure the result conforms to ProductBatchWithDetails interface structure
      return result as unknown as ProductBatchWithDetails;
    } catch (error) {
      console.error('Error fetching batch details:', error);
      return null;
    }
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
}
