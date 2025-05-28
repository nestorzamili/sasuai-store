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
    const product = await ProductService.create({
      name: validatedData.name,
      categoryId: validatedData.categoryId,
      brandId: validatedData.brandId,
      description: validatedData.description,
      unitId: validatedData.unitId,
      price: validatedData.price,
      skuCode: validatedData.skuCode,
      barcode: validatedData.barcode,
      isActive: validatedData.isActive,
    });

    // Revalidate products page
    revalidatePath('/products');

    return {
      success: true,
      data: product,
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
    console.error('Failed to delete product:', error);
    return {
      success: false,
      error: 'Failed to delete product',
    };
  }
}

/**
 * Get product images for a specific product
 */
export async function getProductImages(productId: string) {
  try {
    const images = await ProductService.getProductImages(productId);

    return {
      success: true,
      data: images,
    };
  } catch (error) {
    console.error('Failed to fetch product images:', error);
    return {
      success: false,
      error: 'Failed to fetch product images',
    };
  }
}

/**
 * Set primary image for a product
 */
export async function setPrimaryImage(imageId: string, productId: string) {
  try {
    await ProductService.setPrimaryImage(imageId, productId);

    // Revalidate product detail
    revalidatePath(`/products/${productId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to set primary image:', error);
    return {
      success: false,
      error: 'Failed to set primary image',
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
    console.error('Failed to delete product image:', error);
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
        units,
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
  minPrice?: number;
  maxPrice?: number;
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
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
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
