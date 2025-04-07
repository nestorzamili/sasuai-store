'use server';

import { revalidatePath } from 'next/cache';
import { StockMovementService } from '@/lib/services/stock-movement.service';
import { z } from 'zod';

// Schema for stock-in creation
const stockInSchema = z.object({
  batchId: z.string().uuid('Invalid batch ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitId: z.string().uuid('Invalid unit ID'),
  date: z.coerce.date(),
  supplierId: z.string().uuid('Invalid supplier ID').optional(),
});

// Schema for stock-out creation
const stockOutSchema = z.object({
  batchId: z.string().uuid('Invalid batch ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitId: z.string().uuid('Invalid unit ID'),
  date: z.coerce.date(),
  reason: z.string().min(1, 'Reason is required'),
});

/**
 * Get all stock-in records
 */
export async function getAllStockIns() {
  try {
    const stockIns = await StockMovementService.getAllStockIns({
      includeBatch: true,
      includeSupplier: true,
      includeUnit: true,
    });

    return {
      success: true,
      data: stockIns,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch stock-in records',
    };
  }
}

/**
 * Get stock-ins for a specific batch
 */
export async function getStockInsByBatchId(batchId: string) {
  try {
    const stockIns = await StockMovementService.getStockInsByBatchId(batchId);

    return {
      success: true,
      data: stockIns,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch stock-in records',
    };
  }
}

/**
 * Create a new stock-in record
 */
export async function createStockIn(data: {
  batchId: string;
  quantity: number;
  unitId: string;
  date: Date;
  supplierId?: string;
}) {
  try {
    // Validate data
    const validatedData = stockInSchema.parse(data);

    // Create stock-in record
    const stockIn = await StockMovementService.createStockIn({
      batchId: validatedData.batchId,
      quantity: validatedData.quantity,
      unitId: validatedData.unitId,
      date: validatedData.date,
      supplierId: validatedData.supplierId,
    });

    // Revalidate paths
    revalidatePath('/inventory');

    return {
      success: true,
      data: stockIn,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create stock-in record',
    };
  }
}

/**
 * Get all stock-out records
 */
export async function getAllStockOuts(includeTransactions: boolean = true) {
  try {
    const stockOuts = await StockMovementService.getAllStockOuts({
      includeBatch: true,
      includeUnit: true,
      includeTransactions,
    });

    return {
      success: true,
      data: stockOuts,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch stock-out records',
    };
  }
}

/**
 * Get stock-outs for a specific batch
 */
export async function getStockOutsByBatchId(batchId: string) {
  try {
    const stockOuts = await StockMovementService.getStockOutsByBatchId(batchId);

    return {
      success: true,
      data: stockOuts,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch stock-out records',
    };
  }
}

/**
 * Get transaction-related stock reductions for a specific batch
 */
export async function getTransactionStockOutsByBatchId(batchId: string) {
  try {
    const transactionItems =
      await StockMovementService.getTransactionStockOutsByBatchId(batchId);

    return {
      success: true,
      data: transactionItems,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch transaction stock-out records',
    };
  }
}

/**
 * Create a new stock-out record
 */
export async function createStockOut(data: {
  batchId: string;
  quantity: number;
  unitId: string;
  date: Date;
  reason: string;
}) {
  try {
    // Validate data
    const validatedData = stockOutSchema.parse(data);

    // Create stock-out record
    const stockOut = await StockMovementService.createStockOut({
      batchId: validatedData.batchId,
      quantity: validatedData.quantity,
      unitId: validatedData.unitId,
      date: validatedData.date,
      reason: validatedData.reason,
    });

    // Revalidate paths
    revalidatePath('/inventory');

    return {
      success: true,
      data: stockOut,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create stock-out record',
    };
  }
}

/**
 * Get batch stock movement history
 */
export async function getBatchStockMovementHistory(batchId: string) {
  try {
    const movements = await StockMovementService.getBatchStockMovementHistory(
      batchId,
    );

    return {
      success: true,
      data: movements,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch stock movement history',
    };
  }
}

/**
 * Get product stock movement history
 */
export async function getProductStockMovementHistory(productId: string) {
  try {
    const movements = await StockMovementService.getProductStockMovementHistory(
      productId,
    );

    return {
      success: true,
      data: movements,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch product stock movement history',
    };
  }
}
