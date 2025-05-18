'use server';

import { revalidatePath } from 'next/cache';
import { DiscountService } from '@/lib/services/discount.service';
import { ProductService } from '@/lib/services/product.service';
import { DiscountData, DiscountPaginationParams } from '@/lib/types/discount';
import { z } from 'zod';
import { errorHandling } from '@/lib/common/response-formatter';
import { discountSchema, partialDiscountSchema } from './schema';

/**
 * Get all discounts with pagination/sort/search/filter
 */
export async function getAllDiscounts(options: DiscountPaginationParams) {
  try {
    const result = await DiscountService.getPaginated(options);
    return result;
  } catch (error) {
    return errorHandling({
      message: 'Failed to fetch discounts',
      details: error,
    });
  }
}

/**
 * Get a discount by ID
 */
export async function getDiscount(id: string) {
  try {
    return await DiscountService.getDiscountById(id);
  } catch (error) {
    return errorHandling({
      message: 'Failed to fetch discount',
      details: error,
    });
  }
}

/**
 * Create a new discount
 */
export async function createDiscount(data: DiscountData) {
  try {
    // Validate data
    const validatedData = discountSchema.parse(data);

    // Create discount - add type assertion to fix type error
    const result = await DiscountService.createDiscount(
      validatedData as DiscountData
    );

    if (result.success) {
      // Revalidate discounts page
      revalidatePath('/discounts');
    }

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorHandling({
        message: 'Validation error',
        details: { validationErrors: error.errors },
      });
    }

    return errorHandling({
      message: 'Failed to create discount',
      details: error,
    });
  }
}

/**
 * Update a discount
 */
export async function updateDiscount(id: string, data: Partial<DiscountData>) {
  try {
    const validatedData = partialDiscountSchema.parse(data);
    const result = await DiscountService.updateDiscount(id, validatedData);
    if (result.success) {
      // Revalidate discounts page
      revalidatePath('/discounts');
    }

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorHandling({
        message: 'Validation error',
        details: { validationErrors: error.errors },
      });
    }

    return errorHandling({
      message: 'Failed to update discount',
      details: error,
    });
  }
}

/**
 * Toggle discount active status
 */
export async function toggleDiscountStatus(id: string) {
  try {
    const result = await DiscountService.toggleDiscountStatus(id);

    if (result.success) {
      // Revalidate discounts page
      revalidatePath('/discounts');
    }

    return result;
  } catch (error) {
    return errorHandling({
      message: 'Failed to toggle discount status',
      details: error,
    });
  }
}

/**
 * Delete a discount
 */
export async function deleteDiscount(id: string) {
  try {
    const result = await DiscountService.deleteDiscount(id);

    if (result.success) {
      // Revalidate discounts page
      revalidatePath('/discounts');
    }

    return result;
  } catch (error) {
    return errorHandling({
      message: 'Failed to delete discount',
      details: error,
    });
  }
}

/**
 * Get products for discount selection
 */
export async function getProductsForSelection(search?: string) {
  try {
    const products = await ProductService.getProductFiltered({
      search: search || '',
      take: 10,
    });

    return products;
  } catch (error) {
    return errorHandling({
      message: 'Failed to fetch products',
      details: error,
    });
  }
}

/**
 * Get members for discount selection
 */
export async function getMembersForSelection(search?: string) {
  try {
    return await DiscountService.getMembersForSelection(search);
  } catch (error) {
    return errorHandling({
      message: 'Failed to fetch members',
      details: error,
    });
  }
}
/**
 * Get member tiers for discount selection
 */
export async function getMemberTiersForSelection(search?: string) {
  try {
    return await DiscountService.getMemberTiersForSelection(search);
  } catch (error) {
    return errorHandling({
      message: 'Failed to fetch member tiers',
      details: error,
    });
  }
}
