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

interface StockInResponse {
  success: boolean;
  data: any[];
  error?: string;
  meta: { rowsCount: number };
  validationErrors?: any[];
}

export async function getAllStockIns(
  options?: Record<string, any>
): Promise<StockInResponse> {
  try {
    const stockIns = await StockMovementService.getAllStockIns(options);

    // Ensure the response has the expected structure
    if (!stockIns || !Array.isArray(stockIns.data)) {
      console.error(
        'Invalid response format from getAllStockInsOptimalized',
        stockIns
      );
      return {
        success: false,
        error: 'Invalid response format from server',
        data: [],
        meta: { rowsCount: 0 },
      };
    }

    return {
      success: true,
      data: stockIns.data,
      meta: stockIns.meta || { rowsCount: stockIns.data.length },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch stock-in records',
      data: [],
      meta: { rowsCount: 0 },
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
 * Get all stock-out records with pagination support
 */
export async function getAllStockOuts(options?: Record<string, any>) {
  try {
    const stockOuts = await StockMovementService.getAllStockOuts(options);
    return {
      success: true,
      data: stockOuts.data,
      meta: stockOuts.meta,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch stock-out records',
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
      batchId
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
