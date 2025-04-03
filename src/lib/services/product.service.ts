import prisma from '@/lib/prisma';
import { ProductWithRelations } from '@/lib/types/product';

export class ProductService {
  /**
   * Get all products
   */
  static async getAll() {
    return prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get all products with related data
   */
  static async getAllWithRelations(): Promise<ProductWithRelations[]> {
    return prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true,
            id: true,
          },
        },
        brand: {
          select: {
            name: true,
            id: true,
            logoUrl: true,
          },
        },
        images: {
          where: {
            isPrimary: true,
          },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get a product by ID
   */
  static async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        },
        variants: {
          include: {
            unit: true,
            batches: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    });
  }

  /**
   * Create a new product
   */
  static async create(data: {
    name: string;
    categoryId: string;
    brandId?: string | null;
    description?: string | null;
    isActive?: boolean;
  }) {
    return prisma.product.create({
      data,
    });
  }

  /**
   * Update a product
   */
  static async update(
    id: string,
    data: {
      name?: string;
      categoryId?: string;
      brandId?: string | null;
      description?: string | null;
      isActive?: boolean;
    },
  ) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a product
   */
  static async delete(id: string) {
    // First delete all related images
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    // Then delete the product
    return prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Get active products
   */
  static async getActive() {
    return prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
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
   * Count products by category
   */
  static async countByCategory() {
    return prisma.product.groupBy({
      by: ['categoryId'],
      _count: true,
    });
  }

  /**
   * Count products by brand
   */
  static async countByBrand() {
    return prisma.product.groupBy({
      by: ['brandId'],
      _count: true,
    });
  }

  /**
   * Get product with variants by ID
   */
  static async getProductWithVariants(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        },
        variants: {
          include: {
            unit: true,
            batches: {
              orderBy: { expiryDate: 'asc' },
              include: {
                barcodes: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
    });
  }

  /**
   * Create a new product with variants
   */
  static async createWithVariants(data: {
    name: string;
    categoryId: string;
    brandId?: string | null;
    description?: string | null;
    isActive?: boolean;
    variants: Array<{
      name: string;
      unitId: string;
      price: number;
      skuCode?: string | null;
    }>;
  }) {
    return prisma.product.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        brandId: data.brandId,
        description: data.description,
        isActive: data.isActive ?? true,
        variants: {
          create: data.variants.map((variant) => ({
            name: variant.name,
            unitId: variant.unitId,
            price: variant.price,
            skuCode: variant.skuCode,
            currentStock: 0, // Initial stock is zero
          })),
        },
      },
      include: {
        category: true,
        brand: true,
        variants: {
          include: {
            unit: true,
          },
        },
      },
    });
  }

  /**
   * Update a product with variants
   */
  static async updateWithVariants(
    id: string,
    data: {
      name?: string;
      categoryId?: string;
      brandId?: string | null;
      description?: string | null;
      isActive?: boolean;
      variants?: Array<{
        id?: string; // If provided, update existing variant
        name: string;
        unitId: string;
        price: number;
        skuCode?: string | null;
      }>;
    },
  ) {
    // Start a transaction
    return prisma.$transaction(async (tx) => {
      // 1. Update the product basic information
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          categoryId: data.categoryId,
          brandId: data.brandId,
          description: data.description,
          isActive: data.isActive,
        },
      });

      // 2. Handle variants if provided
      if (data.variants && data.variants.length > 0) {
        // Get existing variants
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id },
        });

        // Process each variant from the input
        for (const variant of data.variants) {
          if (variant.id) {
            // Update existing variant
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                name: variant.name,
                unitId: variant.unitId,
                price: variant.price,
                skuCode: variant.skuCode,
              },
            });
          } else {
            // Create new variant
            await tx.productVariant.create({
              data: {
                productId: id,
                name: variant.name,
                unitId: variant.unitId,
                price: variant.price,
                skuCode: variant.skuCode,
                currentStock: 0, // Initial stock is zero
              },
            });
          }
        }
      }

      // Get the updated product with all relations
      return tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          brand: true,
          variants: {
            include: {
              unit: true,
            },
            orderBy: { name: 'asc' },
          },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
          },
        },
      });
    });
  }

  /**
   * Delete a variant
   */
  static async deleteVariant(variantId: string) {
    // Check if there are batches with remaining stock
    const hasBatchesWithStock = await prisma.productBatch.findFirst({
      where: {
        variantId,
        remainingQuantity: { gt: 0 },
      },
    });

    if (hasBatchesWithStock) {
      throw new Error('Cannot delete variant with remaining stock');
    }

    // Delete associated batches first (and cascade to barcodes)
    await prisma.productBatch.deleteMany({
      where: { variantId },
    });

    // Delete the variant
    return prisma.productVariant.delete({
      where: { id: variantId },
    });
  }

  /**
   * Search products
   */
  static async search(
    query: string,
    options: {
      categoryId?: string;
      brandId?: string;
      isActive?: boolean;
      limit?: number;
      page?: number;
    } = {},
  ) {
    const { categoryId, brandId, isActive, limit = 10, page = 1 } = options;

    const skip = (page - 1) * limit;

    // Build where conditions
    const where: any = {};

    if (query) {
      where.name = { contains: query, mode: 'insensitive' };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (brandId) {
      where.brandId = brandId;
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    // Get products and total count
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
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
            take: 1,
          },
          _count: {
            select: {
              variants: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }
}
