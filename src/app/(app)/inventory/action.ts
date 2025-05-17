'use server';

import { revalidatePath } from 'next/cache';
import { ProductBatchService } from '@/lib/services/inventory.service';
import { z } from 'zod';
import {
  BatchPaginationParams,
  ProductBatchWithDetails,
} from '@/lib/types/product-batch';

// Batch schema for validation
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

// Schema for batch update
const batchUpdateSchema = z.object({
  batchCode: z.string().min(1, 'Batch code is required').optional(),
  expiryDate: z.coerce
    .date()
    .min(new Date(), 'Expiry date must be in the future')
    .optional(),
  buyPrice: z.number().int().min(0, 'Buy price cannot be negative').optional(),
});

// Schema for quantity adjustment
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

/**
 * Get optimalized (paginated and filtered) product batches
 */
export async function getAllBatches({
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
  try {
    // Convert string values to their appropriate types
    const processedOptions: BatchPaginationParams = {
      page: Number(page),
      pageSize: Number(pageSize),
      sortField,
      sortDirection,
      search,
      productId,
      expiryDateStart: expiryDateStart ? new Date(expiryDateStart) : undefined,
      expiryDateEnd: expiryDateEnd ? new Date(expiryDateEnd) : undefined,
      minRemainingQuantity:
        minRemainingQuantity !== undefined
          ? Number(minRemainingQuantity)
          : undefined,
      maxRemainingQuantity:
        maxRemainingQuantity !== undefined
          ? Number(maxRemainingQuantity)
          : undefined,
      includeExpired:
        typeof includeExpired === 'string'
          ? includeExpired === 'true'
          : includeExpired,
      includeOutOfStock:
        typeof includeOutOfStock === 'string'
          ? includeOutOfStock === 'true'
          : includeOutOfStock,
      categoryId,
    };

    const result = await ProductBatchService.getPaginated(processedOptions);

    return {
      success: true,
      data: result.data,
      meta: {
        totalRows: result.pagination.totalCount,
        totalPages: result.pagination.totalPages,
        currentPage: result.pagination.currentPage,
        pageSize: result.pagination.pageSize,
      },
    };
  } catch (error) {
    console.error('Error in getAllBatches:', error);
    return {
      success: false,
      error: 'Failed to fetch batch',
      data: [],
      meta: { totalRows: 0, totalPages: 0, currentPage: 1, pageSize: 10 },
    };
  }
}

/**
 * Get a specific batch by ID with all details
 */
export async function getBatchById(id: string) {
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
      data: batch as ProductBatchWithDetails,
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
 * Create a new product batch
 */
export async function createBatch(data: {
  productId: string;
  batchCode: string;
  expiryDate: Date;
  initialQuantity: number;
  buyPrice: number;
  unitId: string;
  supplierId?: string | null;
}) {
  try {
    // Validate data
    const validatedData = batchSchema.parse(data);

    // Transform "none" value or null to undefined for supplierId
    const supplierId =
      validatedData.supplierId === 'none' || validatedData.supplierId === null
        ? undefined
        : validatedData.supplierId;

    // Create batch
    const result = await ProductBatchService.create({
      ...validatedData,
      supplierId,
    });

    // Revalidate inventory paths
    revalidatePath('/inventory/batches');
    revalidatePath('/inventory/products');
    revalidatePath('/inventory/stock');

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
  data: {
    batchCode?: string;
    expiryDate?: Date;
    buyPrice?: number;
  },
) {
  try {
    // Validate data
    const validatedData = batchUpdateSchema.parse(data);

    // Update batch
    const batch = await ProductBatchService.update(id, validatedData);

    // Revalidate inventory paths
    revalidatePath('/inventory/batches');

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
 * Adjust batch quantity
 */
export async function adjustBatchQuantity(
  id: string,
  data: {
    adjustment: number;
    reason: string;
    unitId: string;
  },
) {
  try {
    // Validate data
    const validatedData = adjustmentSchema.parse(data);

    // Adjust quantity
    const batch = await ProductBatchService.adjustQuantity(
      id,
      validatedData.adjustment,
      validatedData.reason,
      validatedData.unitId,
    );

    // Revalidate inventory paths
    revalidatePath('/inventory/batches');
    revalidatePath('/inventory/products');
    revalidatePath('/inventory/stock');

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

/**
 * Check if a batch can be deleted
 */
export async function canDeleteBatch(id: string) {
  try {
    const canDelete = await ProductBatchService.canDelete(id);

    return {
      success: true,
      canDelete,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to check if batch can be deleted',
      canDelete: false,
    };
  }
}

/**
 * Delete a batch
 */
export async function deleteBatch(id: string) {
  try {
    // Check if batch can be deleted
    const canDelete = await ProductBatchService.canDelete(id);

    if (!canDelete) {
      return {
        success: false,
        error:
          'Cannot delete batch with existing transactions or stock movements',
      };
    }

    // Delete batch
    await ProductBatchService.delete(id);

    // Revalidate inventory paths
    revalidatePath('/inventory/batches');
    revalidatePath('/inventory/products');
    revalidatePath('/inventory/stock');

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete batch',
    };
  }
}
