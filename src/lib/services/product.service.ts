import prisma from '@/lib/prisma';
import { options } from '@/lib/types/table';
import { buildQueryOptions } from '../common/query-options';
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
  // Optimalize getAll
  static async getAllOptimized(queryOptions?: options) {
    const options = buildQueryOptions(queryOptions);
    const [products, count] = await Promise.all([
      prisma.product.findMany({
        include: {
          category: true,
          brand: true,
          unit: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
        ...options,
      }),
      prisma.product.count(),
    ]);
    return {
      data: products,
      meta: {
        ...options,
        rowsCount: count,
      },
    };
  }

  /**
   * Get all products with minimal data (just id and name)
   * @returns Promise<{id: string, name: string, isActive: boolean}[]>
   */
  static async getAllMinimal() {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return products;
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
    }
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
    }
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

  /**
   * Get paginated products with filters and sorting
   */
  static async getPaginated({
    page = 1,
    pageSize = 10,
    sortField = 'name',
    sortDirection = 'asc',
    search = '',
    categoryId,
    brandId,
    isActive,
  }: {
    page?: number;
    pageSize?: number;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    search?: string;
    categoryId?: string;
    brandId?: string;
    isActive?: boolean;
  }) {
    // Build where clause based on filters
    const where: any = {};

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { skuCode: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add other filters
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (isActive !== undefined) where.isActive = isActive;

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Get order by field - handle nested fields like 'category.name'
    const orderBy: any = {};

    // Handle nested fields
    if (sortField.includes('.')) {
      const [relation, field] = sortField.split('.');
      orderBy[relation] = { [field]: sortDirection };
    } else {
      orderBy[sortField] = sortDirection;
    }

    // Execute query with count
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          unit: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: {
              images: true,
              batches: true,
            },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    // Process product data to include primary image URL and other calculated fields
    const processedProducts = products.map((product) => ({
      ...product,
      primaryImage: product.images?.[0]?.imageUrl || null,
      batchCount: product._count?.batches || 0,
    }));

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      products: processedProducts,
      totalCount,
      totalPages,
      currentPage: page,
    };
  }

  /**
   * Get product images for a specific product
   * Returns images with fullUrl property for frontend display
   */
  static async getProductImages(productId: string) {
    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });

    // Format the images to include the full URL with f_auto,q_auto parameters
    return images.map((image) => ({
      ...image,
      fullUrl: image.imageUrl.includes('cloudinary.com')
        ? image.imageUrl.replace('/upload/', '/upload/f_auto,q_auto/')
        : image.imageUrl,
    }));
  }

  /**
   * Set primary product image
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
  // Function get products for order
  static async getProductFiltered(options?: { search?: string; take: 10 }) {
    return prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: options?.search, mode: 'insensitive' } },
          { barcode: { contains: options?.search, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      include: {
        batches: {
          where: {
            remainingQuantity: { gt: 0 },
          },
          orderBy: {
            expiryDate: 'asc',
          },
          take: 1,
        },
        discountRelationProduct: {
          where: {
            discount: {
              isActive: true,
            },
          },
          include: {
            discount: true,
          },
        },
      },
      orderBy: { name: 'asc' },
      take: options?.take || 10,
    });
  }
}
