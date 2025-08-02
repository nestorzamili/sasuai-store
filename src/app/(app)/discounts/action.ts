'use server';

import { revalidatePath } from 'next/cache';
import { DiscountService } from '@/lib/services/discount.service';
import { ProductService } from '@/lib/services/product.service';
import type {
  DiscountData,
  DiscountPaginationParams,
  ApiResponse,
  DiscountListData,
  DiscountWithRelations,
} from '@/lib/services/discount/types';

/**
 * Get discounts with pagination and filters
 */
export async function getDiscounts({
  page = 1,
  pageSize = 10,
  sortField = 'createdAt',
  sortDirection = 'desc',
  search = '',
  isActive,
  type,
  applyTo,
  isGlobal,
  startDate,
  endDate,
}: DiscountPaginationParams): Promise<ApiResponse<DiscountListData>> {
  try {
    const result = await DiscountService.getDiscounts({
      page,
      pageSize,
      sortField,
      sortDirection,
      search,
      isActive,
      type,
      applyTo,
      isGlobal,
      startDate,
      endDate,
    });

    return {
      success: result.success,
      data: result.data,
      error: result.error || result.message,
    };
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return {
      success: false,
      error: 'Failed to fetch discounts',
    };
  }
}

/**
 * Get discount by ID
 */
export async function getDiscountById(
  id: string,
): Promise<ApiResponse<DiscountWithRelations | null>> {
  try {
    const result = await DiscountService.getDiscountById(id);

    return {
      success: result.success,
      data: result.data,
      error: result.error || result.message,
    };
  } catch (error) {
    console.error('Error fetching discount details:', error);
    return {
      success: false,
      error: 'Failed to fetch discount details',
    };
  }
}

/**
 * Create a new discount
 */
export async function createDiscount(
  data: DiscountData,
): Promise<ApiResponse<DiscountWithRelations>> {
  try {
    const result = await DiscountService.createDiscount(data);

    if (result.success) {
      revalidatePath('/discounts');
    }

    return {
      success: result.success,
      data: result.data,
      error: result.error || result.message,
    };
  } catch (error) {
    console.error('Error creating discount:', error);
    return {
      success: false,
      error: 'Failed to create discount',
    };
  }
}

/**
 * Update a discount
 */
export async function updateDiscount(
  id: string,
  data: Partial<DiscountData>,
): Promise<ApiResponse<DiscountWithRelations>> {
  try {
    const result = await DiscountService.updateDiscount(id, data);

    if (result.success) {
      revalidatePath('/discounts');
    }

    return {
      success: result.success,
      data: result.data,
      error: result.error || result.message,
    };
  } catch (error) {
    console.error('Error updating discount:', error);
    return {
      success: false,
      error: 'Failed to update discount',
    };
  }
}

/**
 * Delete a discount
 */
export async function deleteDiscount(id: string): Promise<ApiResponse<void>> {
  try {
    const result = await DiscountService.deleteDiscount(id);

    if (result.success) {
      revalidatePath('/discounts');
    }

    return {
      success: result.success,
      error: result.error || result.message,
    };
  } catch (error) {
    console.error('Error deleting discount:', error);
    return {
      success: false,
      error: 'Failed to delete discount',
    };
  }
}

/**
 * Get member tiers for discount selection
 */
export async function getMemberTiers(search?: string) {
  try {
    const result = await DiscountService.getMemberTiers(search);

    return {
      success: result.success,
      data: result.data,
      error: result.error || result.message,
    };
  } catch (error) {
    console.error('Error fetching member tiers:', error);
    return {
      success: false,
      error: 'Failed to fetch member tiers',
    };
  }
}

/**
 * Get members for discount selection
 */
export async function getMembers(search?: string) {
  try {
    const result = await DiscountService.getMembers(search);

    return {
      success: result.success,
      data: result.data,
      error: result.error || result.message,
    };
  } catch (error) {
    console.error('Error fetching members:', error);
    return {
      success: false,
      error: 'Failed to fetch members',
    };
  }
}

/**
 * Get products for selection in discount form
 */
export async function getProductsForSelection(search: string): Promise<
  ApiResponse<
    Array<{
      id: string;
      name: string;
      barcode?: string;
      category?: { name: string };
      brand?: { name: string };
    }>
  >
> {
  try {
    const result = await ProductService.search({
      query: search,
      limit: 50, // Limit results for selection dropdown
      page: 1,
      sortBy: 'name',
      sortDirection: 'asc',
      isActive: true, // Only show active products
    });

    // Transform to the expected format
    const products = result.products.map((product) => ({
      id: product.id,
      name: product.name,
      barcode: product.barcode || undefined,
      category: product.category ? { name: product.category.name } : undefined,
      brand: product.brand ? { name: product.brand.name } : undefined,
    }));

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error('Error fetching products for selection:', error);
    return {
      success: false,
      error: 'Failed to fetch products',
    };
  }
}
