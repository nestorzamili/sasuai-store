'use server';

import { revalidatePath } from 'next/cache';
import { StockMovementService } from '@/lib/services/stock-movement.service';
import {
  StockMovementSearchParams,
  CreateStockInData,
  CreateStockOutData,
  CreateStockInResponse,
  CreateStockOutResponse,
  GetStockMovementHistoryResponse,
} from '@/lib/types/inventory';

export async function getAllStockIns(params: StockMovementSearchParams = {}) {
  try {
    const result = await StockMovementService.getAllStockIns(params);

    return {
      success: true,
      data: result.data,
      meta: { rowsCount: result.meta.totalRows },
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

export async function getAllStockOuts(params: StockMovementSearchParams = {}) {
  try {
    const result = await StockMovementService.getAllStockOuts(params);

    return {
      success: true,
      data: result.data,
      meta: { rowsCount: result.meta.totalRows },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch stock-out records',
      data: [],
      meta: { rowsCount: 0 },
    };
  }
}

/**
 * Create a new stock in record
 */
export async function createStockIn(
  data: CreateStockInData,
): Promise<CreateStockInResponse> {
  try {
    const stockIn = await StockMovementService.createStockIn(data);

    // Revalidate inventory and products pages
    revalidatePath('/inventory');
    revalidatePath('/products');

    return {
      success: true,
      data: stockIn,
    };
  } catch (error) {
    console.error('Failed to create stock in:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create stock in',
    };
  }
}

/**
 * Create a new stock out record
 */
export async function createStockOut(
  data: CreateStockOutData,
): Promise<CreateStockOutResponse> {
  try {
    const stockOut = await StockMovementService.createStockOut(data);

    // Revalidate inventory and products pages
    revalidatePath('/inventory');
    revalidatePath('/products');

    return {
      success: true,
      data: stockOut,
    };
  } catch (error) {
    console.error('Failed to create stock out:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create stock out',
    };
  }
}

/**
 * Get stock movement history for a batch
 */
export async function getBatchStockMovementHistory(
  batchId: string,
): Promise<GetStockMovementHistoryResponse> {
  try {
    const movements =
      await StockMovementService.getBatchStockMovementHistory(batchId);
    return {
      success: true,
      data: movements,
    };
  } catch (error) {
    console.error('Failed to get batch stock movement history:', error);
    return {
      success: false,
      error: 'Failed to get stock movement history',
    };
  }
}
