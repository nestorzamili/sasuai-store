import prisma from '@/lib/prisma';
import type {
  PreparedTransactionItem,
  PrismaTransactionContext,
} from './types';

export class Inventory {
  /**
   * Update inventory after transaction (optimized with batch operations)
   */
  static async updateStock(
    tx: PrismaTransactionContext,
    items: PreparedTransactionItem[],
  ): Promise<void> {
    // Group items by batchId to optimize database queries
    const batchUpdates = new Map<
      string,
      { quantity: number; productId: string }
    >();
    const productUpdates = new Map<string, number>();

    // First, get all batch information in a single query
    const batchIds = items.map((item) => item.batchId);
    const batches = await tx.productBatch.findMany({
      where: { id: { in: batchIds } },
      select: { id: true, productId: true, remainingQuantity: true },
    });

    const batchMap = new Map(batches.map((batch) => [batch.id, batch]));

    // Prepare batch operations
    for (const item of items) {
      const batch = batchMap.get(item.batchId);
      if (!batch) {
        throw new Error(`Batch with ID ${item.batchId} not found`);
      }

      // Note: Stock availability was already validated in Cart validator
      // We can trust the validated cart data here

      // Accumulate batch updates
      if (batchUpdates.has(item.batchId)) {
        const existing = batchUpdates.get(item.batchId)!;
        existing.quantity += item.quantity;
      } else {
        batchUpdates.set(item.batchId, {
          quantity: item.quantity,
          productId: batch.productId,
        });
      }

      // Accumulate product updates
      if (productUpdates.has(batch.productId)) {
        productUpdates.set(
          batch.productId,
          productUpdates.get(batch.productId)! + item.quantity,
        );
      } else {
        productUpdates.set(batch.productId, item.quantity);
      }
    }

    // Execute batch updates in parallel
    const updatePromises: Promise<unknown>[] = [];

    // Update batch quantities
    for (const [batchId, update] of batchUpdates) {
      updatePromises.push(
        tx.productBatch.update({
          where: { id: batchId },
          data: { remainingQuantity: { decrement: update.quantity } },
        }),
      );
    }

    // Update product stock
    for (const [productId, quantity] of productUpdates) {
      updatePromises.push(
        tx.product.update({
          where: { id: productId },
          data: { currentStock: { decrement: quantity } },
        }),
      );
    }

    // Execute all updates in parallel
    await Promise.all(updatePromises);
  }

  /**
   * Check stock availability for multiple items
   */
  static async checkAvailability(productIds: string[]): Promise<{
    available: string[];
    unavailable: string[];
  }> {
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        currentStock: true,
        isActive: true,
      },
    });

    const available: string[] = [];
    const unavailable: string[] = [];

    for (const productId of productIds) {
      const product = products.find((p) => p.id === productId);

      if (product && product.isActive && product.currentStock > 0) {
        available.push(productId);
      } else {
        unavailable.push(productId);
      }
    }

    return { available, unavailable };
  }

  /**
   * Get available batches for products
   */
  static async getAvailableBatches(productIds: string[]) {
    return await prisma.productBatch.findMany({
      where: {
        productId: { in: productIds },
        remainingQuantity: { gt: 0 },
        expiryDate: { gte: new Date() },
      },
      orderBy: {
        expiryDate: 'asc', // FIFO - First expiry first
      },
    });
  }
}
