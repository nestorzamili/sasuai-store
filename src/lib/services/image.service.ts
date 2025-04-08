import prisma from '@/lib/prisma';
import { extractPublicId } from '@/utils/image';
import { CloudinaryUploadResult } from '@/lib/types/cloudinary';

export class ImageService {
  /**
   * Add image to a product
   */
  static async addProductImage(
    productId: string,
    uploadResult: CloudinaryUploadResult,
    isPrimary: boolean = false,
  ) {
    const publicId = extractPublicId(uploadResult);

    // If this is set as primary, unset any existing primary image
    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: {
          productId: productId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return prisma.productImage.create({
      data: {
        productId,
        imageUrl: publicId, // Store public_id for better reuse with transformations
        isPrimary,
      },
    });
  }

  /**
   * Set an image as primary for a product
   */
  static async setPrimaryImage(imageId: string, productId: string) {
    // First unset any existing primary image
    await prisma.productImage.updateMany({
      where: {
        productId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });

    // Then set the new primary image
    return prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
  }

  /**
   * Get all images for a product
   */
  static async getProductImages(productId: string) {
    return prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * Get primary image for a product
   */
  static async getProductPrimaryImage(productId: string) {
    return prisma.productImage.findFirst({
      where: {
        productId,
        isPrimary: true,
      },
    });
  }

  /**
   * Delete a product image
   */
  static async deleteProductImage(imageId: string) {
    // Get the image data first to check if it's primary
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // Delete the image
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    // If this was a primary image, set another image as primary (if exists)
    if (image.isPrimary) {
      const anotherImage = await prisma.productImage.findFirst({
        where: { productId: image.productId },
      });

      if (anotherImage) {
        await prisma.productImage.update({
          where: { id: anotherImage.id },
          data: { isPrimary: true },
        });
      }
    }

    return image;
  }

  /**
   * Add/update brand logo
   */
  static async updateBrandLogo(
    brandId: string,
    uploadResult: CloudinaryUploadResult,
  ) {
    const publicId = extractPublicId(uploadResult);

    return prisma.brand.update({
      where: { id: brandId },
      data: {
        logoUrl: publicId,
      },
    });
  }

  /**
   * Remove brand logo
   */
  static async removeBrandLogo(brandId: string) {
    return prisma.brand.update({
      where: { id: brandId },
      data: {
        logoUrl: null,
      },
    });
  }
}
