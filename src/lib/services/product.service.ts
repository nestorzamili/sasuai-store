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
    minPrice,
    maxPrice,
  }: {
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

    // Add price filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

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

  static async getProductFiltered(options?: {
    search?: string;
    take?: number;
  }) {
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
        discounts: {
          where: {
            isActive: true,
          },
        },
        category: true,
        unit: true,
        brand: true,
      },
      orderBy: { name: 'asc' },
      take: options?.take || 10,
    });
  }
}
