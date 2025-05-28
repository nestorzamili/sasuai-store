'use server';

import { revalidatePath } from 'next/cache';
import { BrandService } from '@/lib/services/brand.service';
import { z } from 'zod';
import {
  CreateBrandData,
  UpdateBrandData,
  BrandSearchParams,
  GetBrandsResponse,
  GetBrandResponse,
  CreateBrandResponse,
  UpdateBrandResponse,
  DeleteBrandResponse,
  BrandFetchResult,
  BrandWithCount,
} from '@/lib/types/brand';

// Brand validation schema
const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(100, 'Name too long'),
  description: z.string().optional(),
});

/**
 * Get all brands with count and pagination
 */
export async function getAllBrandsWithCount(
  params: BrandSearchParams = {},
): Promise<BrandFetchResult<BrandWithCount[]>> {
  try {
    const result = await BrandService.search({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      sortBy: params.sortBy ?? 'name',
      sortDirection: params.sortDirection ?? 'asc',
      query: params.query ?? '',
    });

    return {
      data: result.brands,
      totalRows: result.totalCount,
    };
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    return {
      data: [],
      totalRows: 0,
    };
  }
}

/**
 * Get all brands (simple list)
 */
export async function getAllBrands(): Promise<GetBrandsResponse> {
  try {
    const brands = await BrandService.getAll();
    return {
      success: true,
      data: {
        brands,
        totalCount: brands.length,
        totalPages: 1,
        currentPage: 1,
      },
    };
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    return { success: false, error: 'Failed to fetch brands' };
  }
}

/**
 * Get a brand by ID
 */
export async function getBrand(id: string): Promise<GetBrandResponse> {
  try {
    const brand = await BrandService.getById(id);
    if (!brand) return { success: false, error: 'Brand not found' };

    // Return brand directly since Brand interface matches what we need
    return { success: true, data: brand };
  } catch (error) {
    console.error('Failed to fetch brand:', error);
    return { success: false, error: 'Failed to fetch brand' };
  }
}

/**
 * Create a new brand
 */
export async function createBrand(
  data: CreateBrandData,
): Promise<CreateBrandResponse> {
  try {
    // Validate data using full schema (not partial) for create operations
    const validatedData = brandSchema.parse(data);

    // Create brand
    const brand = await BrandService.create({
      name: validatedData.name, // Now guaranteed to be string
    });

    // Revalidate brands page
    revalidatePath('/products/brands');

    // Return brand directly
    return { success: true, data: brand };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    console.error('Failed to create brand:', error);
    return { success: false, error: 'Failed to create brand' };
  }
}

/**
 * Update a brand
 */
export async function updateBrand(
  id: string,
  data: UpdateBrandData,
): Promise<UpdateBrandResponse> {
  try {
    // Validate data
    const validatedData = brandSchema.partial().parse(data);

    // Update brand
    const brand = await BrandService.update(id, validatedData);

    // Revalidate brands page
    revalidatePath('/products/brands');

    // Return brand directly
    return { success: true, data: brand };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    console.error('Failed to update brand:', error);
    return { success: false, error: 'Failed to update brand' };
  }
}

/**
 * Delete a brand
 */
export async function deleteBrand(id: string): Promise<DeleteBrandResponse> {
  try {
    // Check if brand has products
    const hasProducts = await BrandService.hasProducts(id);
    if (hasProducts) {
      return {
        success: false,
        error: 'Cannot delete brand that has associated products',
      };
    }

    // Delete brand
    await BrandService.delete(id);
    revalidatePath('/products/brands');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete brand:', error);
    return { success: false, error: 'Failed to delete brand' };
  }
}

/**
 * Check if brand has products
 */
export async function checkBrandHasProducts(
  id: string,
): Promise<{ hasProducts: boolean }> {
  try {
    const hasProducts = await BrandService.hasProducts(id);
    return { hasProducts };
  } catch (error) {
    console.error('Failed to check brand products:', error);
    return { hasProducts: false };
  }
}
