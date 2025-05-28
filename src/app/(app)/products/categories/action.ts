'use server';

import { revalidatePath } from 'next/cache';
import { CategoryService } from '@/lib/services/category.service';
import { z } from 'zod';
import {
  CreateCategoryData,
  UpdateCategoryData,
  CategorySearchParams,
  GetCategoriesResponse,
  GetCategoryResponse,
  CreateCategoryResponse,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
  CategoryFetchResult,
  CategoryWithCount,
} from '@/lib/types/category';

// Category schema for validation
const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Name too long'),
  description: z.string().optional(),
});

/**
 * Get all categories with product count, support pagination/sort/search/filter
 */
export async function getAllCategoriesWithCount(
  params: CategorySearchParams = {},
): Promise<CategoryFetchResult<CategoryWithCount[]>> {
  try {
    const result = await CategoryService.search({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      sortBy: params.sortBy ?? 'name',
      sortDirection: params.sortDirection ?? 'asc',
      query: params.query ?? '',
    });

    return {
      data: result.categories,
      totalRows: result.totalCount,
    };
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return {
      data: [],
      totalRows: 0,
    };
  }
}

/**
 * Get all categories (simple list)
 */
export async function getAllCategories(): Promise<GetCategoriesResponse> {
  try {
    const categories = await CategoryService.getAll();
    return {
      success: true,
      data: {
        categories,
        totalCount: categories.length,
        totalPages: 1,
        currentPage: 1,
      },
    };
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

/**
 * Get a category by ID
 */
export async function getCategory(id: string): Promise<GetCategoryResponse> {
  try {
    const category = await CategoryService.getById(id);
    if (!category) return { success: false, error: 'Category not found' };

    return { success: true, data: category };
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return { success: false, error: 'Failed to fetch category' };
  }
}

/**
 * Create a new category
 */
export async function createCategory(
  data: CreateCategoryData,
): Promise<CreateCategoryResponse> {
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

    return { success: true, data: category };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    console.error('Failed to create category:', error);
    return { success: false, error: 'Failed to create category' };
  }
}

/**
 * Update a category
 */
export async function updateCategory(
  id: string,
  data: UpdateCategoryData,
): Promise<UpdateCategoryResponse> {
  try {
    // Validate data
    const validatedData = categorySchema.partial().parse(data);

    // Update category
    const category = await CategoryService.update(id, validatedData);

    // Revalidate categories page
    revalidatePath('/products/categories');

    return { success: true, data: category };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    console.error('Failed to update category:', error);
    return { success: false, error: 'Failed to update category' };
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(
  id: string,
): Promise<DeleteCategoryResponse> {
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
    revalidatePath('/products/categories');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}

/**
 * Check if category has products
 */
export async function checkCategoryHasProducts(
  id: string,
): Promise<{ hasProducts: boolean }> {
  try {
    const hasProducts = await CategoryService.hasProducts(id);
    return { hasProducts };
  } catch (error) {
    console.error('Failed to check category products:', error);
    return { hasProducts: false };
  }
}
