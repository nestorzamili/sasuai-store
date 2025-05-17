'use server';

import { revalidatePath } from 'next/cache';
import { CategoryService } from '@/lib/services/category.service';
import { z } from 'zod';

// Category schema for validation
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

/**
 * Get all categories with product count, support pagination/sort/search/filter
 */
export async function getAllCategoriesWithCount(options?: {
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
    const columnFilter = options?.columnFilter ?? ['name', 'description'];

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
    const totalRows = await CategoryService.countWithWhere(where);

    // Query data with pagination
    const categories = await CategoryService.getAllCategoriesWithCount({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: categories,
      totalRows,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch categories',
      data: [] as any[], // Explicitly type the empty array
      totalRows: 0,
    };
  }
}

/**
 * Get all categories
 */
export async function getAllCategories() {
  try {
    const categories = await CategoryService.getAll();

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch categories',
    };
  }
}

/**
 * Get a category by ID
 */
export async function getCategory(id: string) {
  try {
    const category = await CategoryService.getById(id);

    if (!category) {
      return {
        success: false,
        error: 'Category not found',
      };
    }

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch category',
    };
  }
}

/**
 * Create a new category
 */
export async function createCategory(data: {
  name: string;
  description?: string;
}) {
  try {
    // Validate data
    const validatedData = categorySchema.parse(data);

    // Create category
    const category = await CategoryService.create({
      name: validatedData.name,
      description: validatedData.description,
    });

    // Revalidate categories page
    revalidatePath('/products/categories');

    return {
      success: true,
      data: category,
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
      error: 'Failed to create category',
    };
  }
}

/**
 * Update a category
 */
export async function updateCategory(
  id: string,
  data: { name?: string; description?: string }
) {
  try {
    // Validate data
    const validatedData = categorySchema.partial().parse(data);

    // Update category
    const category = await CategoryService.update(id, {
      name: validatedData.name,
      description: validatedData.description,
    });

    // Revalidate categories page
    revalidatePath('/products/categories');

    return {
      success: true,
      data: category,
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
      error: 'Failed to update category',
    };
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string) {
  try {
    // Check if category has products
    const hasProducts = await CategoryService.hasProducts(id);

    if (hasProducts) {
      return {
        success: false,
        error: 'Cannot delete category with associated products',
      };
    }

    // Delete category
    await CategoryService.delete(id);

    // Revalidate categories page
    revalidatePath('/products/categories');

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to delete category',
    };
  }
}
