import prisma from '@/lib/prisma';

export class ProductService {
  /**
   * Get all products
   */
  static async getAll() {
    return prisma.product.findMany({
      include: {
        category: true,
        brand: true,
        unit: true,
        images: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get active products
   */
  static async getActive() {
    return prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        brand: true,
        unit: true,
        images: true,
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
        unit: true,
        images: true,
        batches: true,
      },
    });
  }

  /**
   * Get products by category
   */
  static async getByCategory(categoryId: string) {
    return prisma.product.findMany({
      where: { categoryId, isActive: true },
      include: {
        category: true,
        brand: true,
        unit: true,
        images: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get products by brand
   */
  static async getByBrand(brandId: string) {
    return prisma.product.findMany({
      where: { brandId, isActive: true },
      include: {
        category: true,
        brand: true,
        unit: true,
        images: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Search products by name, description, or SKU
   */
  static async search(query: string) {
    return prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { skuCode: { contains: query, mode: 'insensitive' } },
          { barcode: { contains: query, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      include: {
        category: true,
        brand: true,
        unit: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
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
    unitId: string;
    price: number;
    skuCode?: string | null;
    barcode?: string | null;
    isActive?: boolean;
  }) {
    return prisma.product.create({
      data,
      include: {
        category: true,
        brand: true,
        unit: true,
      },
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
      unitId?: string;
      price?: number;
      skuCode?: string | null;
      barcode?: string | null;
      isActive?: boolean;
    },
  ) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        brand: true,
        unit: true,
        images: true,
      },
    });
  }

  /**
   * Delete a product
   */
  static async delete(id: string) {
    // First delete related images and batches
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    await prisma.productBatch.deleteMany({
      where: { productId: id },
    });

    // Then delete the product
    return prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Add product image
   */
  static async addImage(data: {
    productId: string;
    imageUrl: string;
    isPrimary: boolean;
  }) {
    // If this is a primary image, make all other images non-primary
    if (data.isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId: data.productId },
        data: { isPrimary: false },
      });
    }

    return prisma.productImage.create({
      data,
    });
  }

  /**
   * Update product image
   */
  static async updateImage(id: string, data: { isPrimary?: boolean }) {
    // If making this image primary, update all other images
    if (data.isPrimary) {
      const image = await prisma.productImage.findUnique({
        where: { id },
      });

      if (image) {
        await prisma.productImage.updateMany({
          where: { productId: image.productId, id: { not: id } },
          data: { isPrimary: false },
        });
      }
    }

    return prisma.productImage.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete product image
   */
  static async deleteImage(id: string) {
    const image = await prisma.productImage.findUnique({
      where: { id },
    });

    const result = await prisma.productImage.delete({
      where: { id },
    });

    // If the deleted image was primary, make another image primary if any exist
    if (image && image.isPrimary) {
      const firstImage = await prisma.productImage.findFirst({
        where: { productId: image.productId },
      });

      if (firstImage) {
        await prisma.productImage.update({
          where: { id: firstImage.id },
          data: { isPrimary: true },
        });
      }
    }

    return result;
  }

  /**
   * Add product batch
   */
  static async addBatch(data: {
    productId: string;
    batchCode: string;
    expiryDate: Date;
    initialQuantity: number;
    buyPrice: number;
  }) {
    // Create new batch with remaining quantity equal to initial quantity
    const batch = await prisma.productBatch.create({
      data: {
        ...data,
        remainingQuantity: data.initialQuantity,
      },
    });

    // Update product's current stock
    await prisma.product.update({
      where: { id: data.productId },
      data: {
        currentStock: {
          increment: data.initialQuantity,
        },
      },
    });

    return batch;
  }

  /**
   * Update product batch
   */
  static async updateBatch(
    id: string,
    data: {
      batchCode?: string;
      expiryDate?: Date;
      buyPrice?: number;
    },
  ) {
    return prisma.productBatch.update({
      where: { id },
      data,
    });
  }

  /**
   * Get low stock products
   * @param threshold Minimum stock level to consider low
   */
  static async getLowStock(threshold: number = 10) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        currentStock: { lte: threshold },
      },
      include: {
        category: true,
        brand: true,
        unit: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: { currentStock: 'asc' },
    });
  }

  /**
   * Get products with expiring batches
   * @param daysThreshold Number of days to consider as soon expiring
   */
  static async getExpiringProducts(daysThreshold: number = 30) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return prisma.product.findMany({
      where: {
        isActive: true,
        batches: {
          some: {
            expiryDate: { lte: thresholdDate },
            remainingQuantity: { gt: 0 },
          },
        },
      },
      include: {
        category: true,
        brand: true,
        unit: true,
        batches: {
          where: {
            expiryDate: { lte: thresholdDate },
            remainingQuantity: { gt: 0 },
          },
          orderBy: { expiryDate: 'asc' },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });
  }
}
