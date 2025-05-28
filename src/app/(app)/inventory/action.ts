'use server';

import { revalidatePath } from 'next/cache';
import { ProductBatchService } from '@/lib/services/inventory.service';
import { z } from 'zod';
import {
  BatchPaginationParams,
  CreateBatchData,
  UpdateBatchData,
  AdjustQuantityData,
  GetBatchesResponse,
  GetBatchResponse,
  CreateBatchResponse,
  UpdateBatchResponse,
  DeleteBatchResponse,
  AdjustQuantityResponse,
} from '@/lib/types/inventory';

const batchSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  batchCode: z.string().min(1, 'Batch code is required'),
  expiryDate: z.coerce
    .date()
    .min(new Date(), 'Expiry date must be in the future'),
  initialQuantity: z
    .number()
    .int()
    .positive('Initial quantity must be positive'),
  buyPrice: z.number().int().min(0, 'Buy price cannot be negative'),
  unitId: z.string().uuid('Invalid unit ID'),
  supplierId: z.string().uuid('Invalid supplier ID').optional(),
});

const batchUpdateSchema = z.object({
  batchCode: z.string().min(1, 'Batch code is required').optional(),
  expiryDate: z.coerce
    .date()
    .min(new Date(), 'Expiry date must be in the future')
    .optional(),
  buyPrice: z.number().int().min(0, 'Buy price cannot be negative').optional(),
});

const adjustmentSchema = z.object({
  adjustment: z
    .number()
    .int()
    .refine((val) => val !== 0, {
      message: 'Adjustment cannot be zero',
    }),
  reason: z.string().min(1, 'Reason is required'),
  unitId: z.string().uuid('Invalid unit ID'),
});

export async function getAllBatches(
  params: BatchPaginationParams = {},
): Promise<GetBatchesResponse> {
  try {
    const processedParams: BatchPaginationParams = {
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      sortField: params.sortField || 'createdAt',
      sortDirection: params.sortDirection || 'desc',
      search: params.search || '',
      productId: params.productId,
      expiryDateStart: params.expiryDateStart
        ? new Date(params.expiryDateStart)
        : undefined,
      expiryDateEnd: params.expiryDateEnd
        ? new Date(params.expiryDateEnd)
        : undefined,
      minRemainingQuantity: params.minRemainingQuantity
        ? Number(params.minRemainingQuantity)
        : undefined,
      maxRemainingQuantity: params.maxRemainingQuantity
        ? Number(params.maxRemainingQuantity)
        : undefined,
      includeExpired:
        typeof params.includeExpired === 'string'
          ? params.includeExpired === 'true'
          : params.includeExpired,
      includeOutOfStock:
        typeof params.includeOutOfStock === 'string'
          ? params.includeOutOfStock === 'true'
          : params.includeOutOfStock,
      categoryId: params.categoryId,
    };

    const result = await ProductBatchService.getPaginated(processedParams);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error in getAllBatches:', error);
    return {
      success: false,
      error: 'Failed to fetch batches',
    };
  }
}

export async function getBatchById(id: string): Promise<GetBatchResponse> {
  try {
    const batch = await ProductBatchService.getById(id);

    if (!batch) {
      return {
        success: false,
        error: 'Batch not found',
      };
    }

    return {
      success: true,
      data: batch,
    };
  } catch (error) {
    console.error('Error in getBatchById:', error);
    return {
      success: false,
      error: 'Failed to fetch batch',
    };
  }
}

/**
 * Create a new batch
 */
export async function createBatch(
  data: CreateBatchData,
): Promise<CreateBatchResponse> {
  try {
    const cleanedData = {
      ...data,
      supplierId: data.supplierId === null ? undefined : data.supplierId,
    };
    const validatedData = batchSchema.parse(cleanedData);

    const supplierId =
      validatedData.supplierId === 'none'
        ? undefined
        : validatedData.supplierId;

    const result = await ProductBatchService.create({
      ...validatedData,
      supplierId,
    });

    // Revalidate inventory pages
    revalidatePath('/inventory');
    revalidatePath('/products');

    return {
      success: true,
      data: result,
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
      error: error instanceof Error ? error.message : 'Failed to create batch',
    };
  }
}

/**
 * Update a batch
 */
export async function updateBatch(
  id: string,
  data: UpdateBatchData,
): Promise<UpdateBatchResponse> {
  try {
    const validatedData = batchUpdateSchema.parse(data);
    const batch = await ProductBatchService.update(id, validatedData);

    // Revalidate inventory pages
    revalidatePath('/inventory');
    revalidatePath('/products');

    return {
      success: true,
      data: batch,
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
      error: error instanceof Error ? error.message : 'Failed to update batch',
    };
  }
}

/**
 * Delete a batch
 */
export async function deleteBatch(id: string): Promise<DeleteBatchResponse> {
  try {
    const canDelete = await ProductBatchService.canDelete(id);

    if (!canDelete) {
      return {
        success: false,
        error:
          'Cannot delete batch with existing transactions or stock movements',
      };
    }

    await ProductBatchService.delete(id);

    // Revalidate inventory pages
    revalidatePath('/inventory');
    revalidatePath('/products');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting batch:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete batch',
    };
  }
}

/**
 * Adjust batch quantity
 */
export async function adjustBatchQuantity(
  id: string,
  data: AdjustQuantityData,
): Promise<AdjustQuantityResponse> {
  try {
    const validatedData = adjustmentSchema.parse(data);

    const batch = await ProductBatchService.adjustQuantity(
      id,
      validatedData.adjustment,
      validatedData.reason,
      validatedData.unitId,
    );

    // Revalidate inventory pages
    revalidatePath('/inventory');
    revalidatePath('/products');

    return {
      success: true,
      data: batch,
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
        error instanceof Error ? error.message : 'Failed to adjust quantity',
    };
  }
}

export async function canDeleteBatch(id: string) {
  try {
    const canDelete = await ProductBatchService.canDelete(id);

    return {
      success: true,
      canDelete,
    };
  } catch (error) {
    console.error('Error checking if batch can be deleted:', error);
    return {
      success: false,
      error: 'Failed to check if batch can be deleted',
      canDelete: false,
    };
  }
}
