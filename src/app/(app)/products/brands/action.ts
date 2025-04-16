'use server';

import { revalidatePath } from 'next/cache';
import { BrandService } from '@/lib/services/brand.service';
import { z } from 'zod';

// Brand schema for validation - removed logoUrl
const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
});

/**
 * Get all brands with product count, support pagination/sort/search/filter
 */
export async function getAllBrandsWithCount(options?: {
  page?: number;
  limit?: number;
  sortBy?: { id: string; desc: boolean };
  search?: string;
  columnFilter?: string[];
}) {
  try {
    // Default values
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const sortBy = options?.sortBy ?? { id: 'name', desc: false };
    const search = options?.search ?? '';
    const columnFilter = options?.columnFilter ?? ['name'];

    // Build where clause for search
    let where: any = {};
    if (search && columnFilter.length > 0) {
      where.OR = columnFilter.map((col) => ({
        [col]: { contains: search, mode: 'insensitive' },
      }));
    }

    // Build orderBy
    let orderBy: any = {};
    if (sortBy && sortBy.id) {
      orderBy[sortBy.id] = sortBy.desc ? 'desc' : 'asc';
    } else {
      orderBy = { name: 'asc' };
    }

    // Count total rows
    const totalRows = await BrandService.countWithWhere(where);

    // Query data with pagination
    const brands = await BrandService.getAllBrandsWithCount({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: brands,
      totalRows,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch brands',
      data: [],
      totalRows: 0,
    };
  }
}

/**
 * Get all brands
 */
export async function getAllBrands() {
  try {
    const brands = await BrandService.getAll();

    return {
      success: true,
      data: brands,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch brands',
    };
  }
}

/**
 * Get a brand by ID
 */
export async function getBrand(id: string) {
  try {
    const brand = await BrandService.getById(id);

    if (!brand) {
      return {
        success: false,
        error: 'Brand not found',
      };
    }

    return {
      success: true,
      data: brand,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch brand',
    };
  }
}

/**
 * Create a new brand
 */
export async function createBrand(data: { name: string }) {
  try {
    // Validate data
    const validatedData = brandSchema.parse(data);

    // Create brand
    const brand = await BrandService.create({
      name: validatedData.name,
    });

    // Revalidate brands page
    revalidatePath('/products/brands');

    return {
      success: true,
      data: brand,
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
      error: 'Failed to create brand',
    };
  }
}

/**
 * Update a brand
 */
export async function updateBrand(id: string, data: { name?: string }) {
  try {
    // Validate data
    const validatedData = brandSchema.partial().parse(data);

    // Update brand
    const brand = await BrandService.update(id, {
      name: validatedData.name,
    });

    // Revalidate brands page
    revalidatePath('/products/brands');

    return {
      success: true,
      data: brand,
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
      error: 'Failed to update brand',
    };
  }
}

/**
 * Delete a brand
 */
export async function deleteBrand(id: string) {
  try {
    // Check if brand has products
    const hasProducts = await BrandService.hasProducts(id);

    if (hasProducts) {
      return {
        success: false,
        error: 'Cannot delete brand with associated products',
      };
    }

    // Delete brand
    await BrandService.delete(id);

    // Revalidate brands page
    revalidatePath('/products/brands');

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to delete brand',
    };
  }
}
