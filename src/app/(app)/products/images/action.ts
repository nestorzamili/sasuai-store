'use server';

import { revalidatePath } from 'next/cache';
import { ProductService } from '@/lib/services/product.service';
import { ImageService } from '@/lib/services/image.service';
import { CloudinaryUploadResult } from '@/lib/types/cloudinary';
import { getImageUrl } from '@/utils/image';

/**
 * Get all products with minimal data for dropdown
 */
export async function getAllProducts() {
  try {
    // Only fetch essential fields: id & name to reduce payload size
    const products = await ProductService.getAllMinimal();

    return {
      success: true,
      data: products, // Explicitly typed as {id: string, name: string, isActive: boolean}[]
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
 * Get images for a product
 */
export async function getProductImages(productId: string) {
  if (!productId) {
    return {
      success: false,
      error: 'Product ID is required',
    };
  }

  try {
    const images = await ImageService.getProductImages(productId);

    // Add full URL for each image
    const imagesWithUrl = images.map((image) => ({
      ...image,
      fullUrl: getImageUrl(image.imageUrl),
    }));

    return {
      success: true,
      data: imagesWithUrl,
    };
  } catch (error) {
    console.error(`Failed to fetch images for product ${productId}:`, error);
    return {
      success: false,
      error: 'Failed to fetch product images',
    };
  }
}

/**
 * Add an image to a product
 */
export async function addProductImage(
  productId: string,
  uploadResult: CloudinaryUploadResult,
  isPrimary: boolean = false,
) {
  try {
    const image = await ImageService.addProductImage(
      productId,
      uploadResult,
      isPrimary,
    );

    revalidatePath(`/products/images`);

    return {
      success: true,
      data: {
        ...image,
        fullUrl: getImageUrl(image.imageUrl),
      },
    };
  } catch (error) {
    console.error(`Failed to add image to product ${productId}:`, error);
    return {
      success: false,
      error: 'Failed to add product image',
    };
  }
}

/**
 * Set an image as primary for a product
 */
export async function setPrimaryProductImage(
  imageId: string,
  productId: string,
) {
  try {
    const image = await ImageService.setPrimaryImage(imageId, productId);

    revalidatePath(`/products/images`);

    return {
      success: true,
      data: image,
    };
  } catch (error) {
    console.error(`Failed to set primary image ${imageId}:`, error);
    return {
      success: false,
      error: 'Failed to set primary image',
    };
  }
}

/**
 * Delete a product image
 */
export async function deleteProductImage(imageId: string) {
  try {
    const image = await ImageService.deleteProductImage(imageId);

    revalidatePath(`/products/images`);

    return {
      success: true,
      data: image,
    };
  } catch (error) {
    console.error(`Failed to delete image ${imageId}:`, error);
    return {
      success: false,
      error: 'Failed to delete image',
    };
  }
}
