import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductVariantService {
  /**
   * Get a variant by ID
   */
  static async getById(id: string) {
    return prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: true,
        unit: true,
        batches: {
          orderBy: { expiryDate: 'asc' },
          include: {
            barcodes: true,
          },
        },
      },
    });
  }

  /**
   * Add batch to variant
   */
  static async addBatch(
    variantId: string,
    data: {
      batchCode: string;
      expiryDate: Date;
      quantity: number;
      buyPrice: number | string | Decimal;
      barcodes?: string[];
    },
  ) {
    return prisma.$transaction(async (tx) => {
      // First, find the variant to make sure it exists
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!variant) {
        throw new Error('Variant not found');
      }

      // Create the batch
      const batch = await tx.productBatch.create({
        data: {
          variantId,
          batchCode: data.batchCode,
          expiryDate: data.expiryDate,
          initialQuantity: data.quantity,
          remainingQuantity: data.quantity,
          buyPrice: data.buyPrice,
        },
      });

      // Create barcodes if provided
      if (data.barcodes && data.barcodes.length > 0) {
        await tx.barcode.createMany({
          data: data.barcodes.map((code, index) => ({
            batchId: batch.id,
            code,
            isPrimary: index === 0, // First barcode is primary
          })),
        });
      }

      // Update the variant's stock
      await tx.productVariant.update({
        where: { id: variantId },
        data: {
          currentStock: {
            increment: data.quantity,
          },
        },
      });

      // Record a StockIn transaction
      await tx.stockIn.create({
        data: {
          batchId: batch.id,
          quantity: data.quantity,
          unitId: variant.unitId,
          date: new Date(),
        },
      });

      return batch;
    });
  }

  /**
   * Update batch
   */
  static async updateBatch(
    batchId: string,
    data: {
      batchCode?: string;
      expiryDate?: Date;
      buyPrice?: number | string | Decimal;
    },
  ) {
    return prisma.productBatch.update({
      where: { id: batchId },
      data,
    });
  }

  /**
   * Add stock to batch
   */
  static async addStockToBatch(
    batchId: string,
    data: {
      quantity: number;
      supplierId?: string;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      // Find the batch
      const batch = await tx.productBatch.findUnique({
        where: { id: batchId },
        include: {
          variant: true,
        },
      });

      if (!batch) {
        throw new Error('Batch not found');
      }

      // Update the batch remaining quantity
      const updatedBatch = await tx.productBatch.update({
        where: { id: batchId },
        data: {
          remainingQuantity: {
            increment: data.quantity,
          },
        },
      });

      // Update the variant's stock
      await tx.productVariant.update({
        where: { id: batch.variantId },
        data: {
          currentStock: {
            increment: data.quantity,
          },
        },
      });

      // Record a StockIn transaction
      await tx.stockIn.create({
        data: {
          batchId,
          quantity: data.quantity,
          unitId: batch.variant.unitId,
          date: new Date(),
          supplierId: data.supplierId,
        },
      });

      return updatedBatch;
    });
  }

  /**
   * Remove stock from batch (wastage, damage, etc.)
   */
  static async removeStockFromBatch(
    batchId: string,
    data: {
      quantity: number;
      reason: string;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      // Find the batch
      const batch = await tx.productBatch.findUnique({
        where: { id: batchId },
        include: {
          variant: true,
        },
      });

      if (!batch) {
        throw new Error('Batch not found');
      }

      if (batch.remainingQuantity < data.quantity) {
        throw new Error('Not enough stock in batch');
      }

      // Update the batch remaining quantity
      const updatedBatch = await tx.productBatch.update({
        where: { id: batchId },
        data: {
          remainingQuantity: {
            decrement: data.quantity,
          },
        },
      });

      // Update the variant's stock
      await tx.productVariant.update({
        where: { id: batch.variantId },
        data: {
          currentStock: {
            decrement: data.quantity,
          },
        },
      });

      // Record a StockOut transaction
      await tx.stockOut.create({
        data: {
          batchId,
          quantity: data.quantity,
          unitId: batch.variant.unitId,
          date: new Date(),
          reason: data.reason,
        },
      });

      return updatedBatch;
    });
  }

  /**
   * Get stock history for a variant
   */
  static async getStockHistory(variantId: string) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        batches: {
          select: { id: true },
        },
      },
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    const batchIds = variant.batches.map((batch) => batch.id);

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
        orderBy: { date: 'desc' },
      }),
      prisma.stockOut.findMany({
        where: {
          batchId: { in: batchIds },
        },
        include: {
          batch: true,
          unit: true,
        },
        orderBy: { date: 'desc' },
      }),
    ]);

    // Combine and sort by date
    const history = [
      ...stockIns.map((item) => ({
        ...item,
        type: 'in' as const,
      })),
      ...stockOuts.map((item) => ({
        ...item,
        type: 'out' as const,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return history;
  }
}
