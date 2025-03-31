import prisma from '@/lib/prisma';
import {
  CreateProductInput,
  UpdateProductInput,
  ProductVariantSchema,
  ProductImageSchema,
  Product,
} from '@/lib/api/schema/product';
import { PaginationParams } from '@/lib/types/common';
import {
  ProductWhereInput,
  ProductBatchCreateInput,
} from '@/lib/types/product';
import {
  ProductVariantCreateInput,
  ProductVariantUpdateInput,
} from '@/lib/types/variant';

export class ProductService {
  /**
   * Get all products with pagination
   */
  static async getProducts({
    page = 1,
    limit = 10,
    search = '',
    categoryId,
    brandId,
    isActive,
  }: PaginationParams & {
    search?: string;
    categoryId?: string;
    brandId?: string;
    isActive?: boolean;
  }) {
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: ProductWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (brandId) {
      where.brandId = brandId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get total count for pagination
    const total = await prisma.product.count({ where: where as any });

    // Get products
    const products = await prisma.product.findMany({
      where: where as any,
      include: {
        category: true,
        brand: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        variants: {
          include: {
            unit: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    // Calculate pagination data
    const totalPages = Math.ceil(total / limit);

    return {
      products,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get a product by its ID
   */
  static async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: true,
        variants: {
          include: {
            unit: true,
            batches: {
              include: {
                barcodes: true,
              },
            },
          },
        },
        productDiscounts: {
          include: {
            discount: true,
          },
        },
      },
    });
  }

  /**
   * Create a new product
   */
  static async createProduct(data: CreateProductInput) {
    return prisma.product.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        description: data.description || null,
        isActive: data.isActive ?? true,
      },
      include: {
        category: true,
        brand: true,
      },
    });
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        categoryId: data.categoryId,
        brandId: data.brandId,
        description: data.description,
        isActive: data.isActive,
      },
      include: {
        category: true,
        brand: true,
      },
    });
  }

  /**
   * Delete a product
   */
  static async deleteProduct(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Add a product variant
   */
  static async addProductVariant(
    productId: string,
    variantData: ProductVariantCreateInput,
  ) {
    const parsedData = ProductVariantSchema.parse({
      ...variantData,
      productId,
    });

    return prisma.productVariant.create({
      data: {
        productId,
        name: parsedData.name,
        unitId: parsedData.unitId,
        price: parsedData.price, // Now properly typed
        currentStock: parsedData.currentStock,
        skuCode: parsedData.skuCode,
      },
      include: {
        unit: true,
      },
    });
  }

  /**
   * Update a product variant
   */
  static async updateProductVariant(
    id: string,
    variantData: ProductVariantUpdateInput,
  ) {
    // Use type casting to avoid Prisma Decimal type issues
    const data = { ...variantData };

    return prisma.productVariant.update({
      where: { id },
      data: data as any,
      include: {
        unit: true,
      },
    });
  }

  /**
   * Delete a product variant
   */
  static async deleteProductVariant(id: string) {
    return prisma.productVariant.delete({
      where: { id },
    });
  }

  /**
   * Add a product image
   */
  static async addProductImage(
    productId: string,
    imageData: { imageUrl: string; isPrimary: boolean },
  ) {
    const parsedData = ProductImageSchema.parse({
      ...imageData,
      productId,
    });

    // If this is set as primary, update other images to be non-primary
    if (parsedData.isPrimary) {
      await prisma.productImage.updateMany({
        where: {
          productId,
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
        imageUrl: parsedData.imageUrl,
        isPrimary: parsedData.isPrimary,
      },
    });
  }

  /**
   * Remove a product image
   */
  static async deleteProductImage(id: string) {
    const image = await prisma.productImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // If this was a primary image, set another image as primary
    if (image.isPrimary) {
      const anotherImage = await prisma.productImage.findFirst({
        where: {
          productId: image.productId,
          id: { not: id },
        },
      });

      if (anotherImage) {
        await prisma.productImage.update({
          where: { id: anotherImage.id },
          data: { isPrimary: true },
        });
      }
    }

    return prisma.productImage.delete({
      where: { id },
    });
  }

  /**
   * Add a batch to a product variant
   */
  static async addProductBatch(
    variantId: string,
    batchData: ProductBatchCreateInput,
  ) {
    const batch = await prisma.productBatch.create({
      data: {
        variantId,
        batchCode: batchData.batchCode,
        expiryDate: batchData.expiryDate,
        initialQuantity: batchData.initialQuantity,
        remainingQuantity:
          batchData.remainingQuantity ?? batchData.initialQuantity,
        buyPrice: batchData.buyPrice, // Now properly typed
      },
    });

    // Update variant current stock
    await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        currentStock: {
          increment: Number(batchData.initialQuantity),
        },
      },
    });

    return batch;
  }

  /**
   * Search products by barcode
   */
  static async findProductByBarcode(barcode: string): Promise<Product | null> {
    const barcodeRecord = await prisma.barcode.findFirst({
      where: { code: barcode },
      include: {
        batch: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    category: true,
                    brand: true,
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                    },
                  },
                },
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!barcodeRecord) return null;

    return barcodeRecord.batch.variant.product;
  }

  /**
   * Search products by name
   */
  static async searchProductsByName(name: string) {
    return prisma.product.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      include: {
        category: true,
        brand: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });
  }

  /**
   * Associate a discount with a product
   */
  static async addDiscountToProduct(productId: string, discountId: string) {
    return prisma.productDiscount.create({
      data: {
        productId,
        discountId,
      },
      include: {
        discount: true,
      },
    });
  }

  /**
   * Remove a discount association from a product
   */
  static async removeDiscountFromProduct(productDiscountId: string) {
    return prisma.productDiscount.delete({
      where: { id: productDiscountId },
    });
  }
}
