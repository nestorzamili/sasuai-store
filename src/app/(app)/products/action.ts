'use server';

import { revalidatePath } from 'next/cache';
import { ProductService } from '@/lib/services/product.service';
import { CategoryService } from '@/lib/services/category.service';
import { BrandService } from '@/lib/services/brand.service';
import { UnitService } from '@/lib/services/unit.service';
import { z } from 'zod';

// Product schema for validation
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  unitId: z.string().min(1, 'Unit is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  skuCode: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Get all products with relations
 */
export async function getAllProducts() {
  try {
    const products = await ProductService.getAll();

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return {
      success: false,
      error: 'Failed to fetch products',
    };
  }
}

/**
 * Get all active products with relations
 */
export async function getActiveProducts() {
  try {
    const products = await ProductService.getActive();

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error('Failed to fetch active products:', error);
    return {
      success: false,
      error: 'Failed to fetch active products',
    };
  }
}

/**
 * Get a product by ID with relations
 */
export async function getProduct(id: string) {
  try {
    const product = await ProductService.getById(id);

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    return {
      success: false,
      error: 'Failed to fetch product',
    };
  }
}

/**
 * Create a new product
 */
export async function createProduct(data: {
  name: string;
  categoryId: string;
  brandId?: string | null;
  description?: string | null;
  unitId: string;
  price: number;
  skuCode?: string | null;
  barcode?: string | null;
  isActive?: boolean;
}) {
  try {
    // Validate data
    const validatedData = productSchema.parse(data);

    // Create product
    const product = await ProductService.create(validatedData);

    // Revalidate products page
    revalidatePath('/products');

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error('Failed to create product:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    return {
      success: false,
      error: 'Failed to create product',
    };
  }
}

/**
 * Update a product
 */
export async function updateProduct(
  id: string,
  data: {
    name?: string;
    categoryId?: string;
    brandId?: string | null;
    description?: string | null;
    unitId?: string;
    price?: number;
    skuCode?: string | null;
    barcode?: string | null;
    isActive?: boolean;
  },
) {
  try {
    // Validate data
    const validatedData = productSchema.partial().parse(data);

    // Update product
    const product = await ProductService.update(id, validatedData);

    // Revalidate products page
    revalidatePath('/products');

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error(`Failed to update product ${id}:`, error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        validationErrors: error.errors,
      };
    }

    return {
      success: false,
      error: 'Failed to update product',
    };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string) {
  try {
    // Delete product
    await ProductService.delete(id);

    // Revalidate products page
    revalidatePath('/products');

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Failed to delete product ${id}:`, error);
    return {
      success: false,
      error: 'Failed to delete product',
    };
  }
}

/**
 * Add product image
 */
export async function addProductImage(data: {
  productId: string;
  imageUrl: string;
  isPrimary: boolean;
}) {
  try {
    const image = await ProductService.addImage(data);

    // Revalidate product detail
    revalidatePath(`/products/${data.productId}`);

    return {
      success: true,
      data: image,
    };
  } catch (error) {
    console.error('Failed to add product image:', error);
    return {
      success: false,
      error: 'Failed to add product image',
    };
  }
}

/**
 * Delete product image
 */
export async function deleteProductImage(id: string, productId: string) {
  try {
    await ProductService.deleteImage(id);

    // Revalidate product detail
    revalidatePath(`/products/${productId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Failed to delete product image ${id}:`, error);
    return {
      success: false,
      error: 'Failed to delete product image',
    };
  }
}

/**
 * Get form options (categories, brands, units)
 */
export async function getProductFormOptions() {
  try {
    const [categories, brands, units] = await Promise.all([
      CategoryService.getAll(),
      BrandService.getAll(),
      UnitService.getAll(),
    ]);

    return {
      success: true,
      data: {
        categories,
        brands,
        units, // Now including units in the response from the service
      },
    };
  } catch (error) {
    console.error('Failed to fetch form options:', error);
    return {
      success: false,
      error: 'Failed to fetch form options',
    };
  }
}

/**
 * Search products
 */
export async function searchProducts(query: string) {
  try {
    if (!query || query.trim().length < 2) {
      return {
        success: true,
        data: [],
      };
    }

    const products = await ProductService.search(query.trim());

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error('Failed to search products:', error);
    return {
      success: false,
      error: 'Failed to search products',
    };
  }
}

/**
 * Get low stock products
 */
export async function getLowStockProducts(threshold: number = 10) {
  try {
    const products = await ProductService.getLowStock(threshold);

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error('Failed to fetch low stock products:', error);
    return {
      success: false,
      error: 'Failed to fetch low stock products',
    };
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categoryId: string) {
  try {
    const products = await ProductService.getByCategory(categoryId);

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error(
      `Failed to fetch products for category ${categoryId}:`,
      error,
    );
    return {
      success: false,
      error: 'Failed to fetch products for this category',
    };
  }
}

/**
 * Get paginated products with filters and sorting
 */
export async function getPaginatedProducts(params: {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
}) {
  try {
    const result = await ProductService.getPaginated({
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      sortField: params.sortField || 'name',
      sortDirection: params.sortDirection || 'asc',
      search: params.search || '',
      categoryId: params.categoryId,
      brandId: params.brandId,
      isActive: params.isActive,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Failed to fetch paginated products:', error);
    return {
      success: false,
      error: 'Failed to fetch paginated products',
    };
  }
}
