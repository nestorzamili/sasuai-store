'use server';

import { revalidatePath } from 'next/cache';
import { ProductService } from '@/lib/services/product.service';
import { ProductFormData, ProductSearchParams } from '@/lib/types/product';
import { getImageUrl } from '@/utils/image';
import { z } from 'zod';

// Validation schema
const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().nullish(),
  description: z.string().nullish(),
  isActive: z.boolean().default(true),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, 'Variant name is required'),
        unitId: z.string().min(1, 'Unit is required'),
        price: z.coerce
          .number()
          .min(0, 'Price must be greater than or equal to 0'),
        skuCode: z.string().nullish(),
      }),
    )
    .min(1, 'At least one variant is required'),
});

/**
 * Get all products with pagination and filtering
 */
export async function getProducts(params: ProductSearchParams = {}) {
  try {
    const result = await ProductService.search(params.query || '', {
      categoryId: params.categoryId,
      brandId: params.brandId,
      isActive: params.isActive,
      page: params.page,
      limit: params.limit,
    });

    // Transform products for the UI
    const products = result.products.map((product) => {
      const primaryImage = product.images?.[0];
      const variants = product.variants || [];

      // Get min and max prices from variants
      const prices = variants.map((v) => Number(v.price));
      const lowestPrice = prices.length > 0 ? Math.min(...prices) : undefined;
      const highestPrice = prices.length > 0 ? Math.max(...prices) : undefined;

      return {
        ...product,
        primaryImage: primaryImage
          ? getImageUrl(primaryImage.imageUrl)
          : undefined,
        variantCount: product._count?.variants || 0,
        lowestPrice,
        highestPrice,
      };
    });

    return {
      success: true,
      data: {
        products,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      },
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
 * Get a product by ID with variants and images
 */
export async function getProduct(id: string) {
  try {
    const product = await ProductService.getProductWithVariants(id);

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    // Add image URLs
    const productWithImageUrls = {
      ...product,
      images: (product.images || []).map((img) => ({
        ...img,
        fullUrl: getImageUrl(img.imageUrl),
      })),
    };

    return {
      success: true,
      data: productWithImageUrls,
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
 * Create a new product with variants
 */
export async function createProduct(data: ProductFormData) {
  try {
    // Validate data
    const validatedData = productFormSchema.parse(data);

    // Create product with variants
    const product = await ProductService.createWithVariants({
      name: validatedData.name,
      categoryId: validatedData.categoryId,
      brandId: validatedData.brandId,
      description: validatedData.description,
      isActive: validatedData.isActive,
      variants: validatedData.variants,
    });

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
export async function updateProduct(id: string, data: ProductFormData) {
  try {
    // Validate data
    const validatedData = productFormSchema.parse(data);

    // Update product
    const product = await ProductService.updateWithVariants(id, {
      name: validatedData.name,
      categoryId: validatedData.categoryId,
      brandId: validatedData.brandId,
      description: validatedData.description,
      isActive: validatedData.isActive,
      variants: validatedData.variants,
    });

    // Revalidate products page and detail page
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);

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
