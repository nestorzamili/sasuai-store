import prisma from '@/lib/prisma';
import {
  CreateProductData,
  UpdateProductData,
  CreateProductImageData,
  UpdateProductImageData,
  ProductSearchParams,
  ProductPaginationParams,
  ProductFilterOptions,
  PaginatedProductResponse,
  ProductWithRelations,
  ProductListItem,
  ProductImageWithUrl,
  ProductWhereInput,
  ProductOrderByInput,
  GetProductsWithOptionsParams,
  ProductForTransaction,
} from '@/lib/types/product';

export class ProductService {
  /**
   * Get all products with basic relations
   */
  static async getAll(): Promise<ProductWithRelations[]> {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        brand: true,
        unit: true,
        images: true,
      },
      orderBy: { name: 'asc' },
    });

    return products as ProductWithRelations[];
  }

  /**
   * Get product by ID with full relations
   */
  static async getById(id: string): Promise<ProductWithRelations | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        unit: true,
        images: true,
        batches: true,
        discounts: {
          where: { isActive: true },
        },
      },
    });

    return product as ProductWithRelations | null;
  }

  /**
   * Create a new product
   */
  static async create(data: CreateProductData): Promise<ProductWithRelations> {
    const product = await prisma.product.create({
      data: {
        ...data,
        cost: data.cost ?? 0,
        isActive: data.isActive ?? true,
      },
      include: {
        category: true,
        brand: true,
        unit: true,
        images: true,
      },
    });

    return product as ProductWithRelations;
  }

  /**
   * Update a product
   */
  static async update(
    id: string,
    data: UpdateProductData,
  ): Promise<ProductWithRelations> {
    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        brand: true,
        unit: true,
        images: true,
      },
    });

    return product as ProductWithRelations;
  }

  /**
   * Delete a product and its related data
   */
  static async delete(id: string): Promise<void> {
    // Delete in correct order to respect foreign key constraints
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    await prisma.productBatch.deleteMany({
      where: { productId: id },
    });

    await prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Add product image
   */
  static async addImage(
    data: CreateProductImageData,
  ): Promise<ProductImageWithUrl> {
    // If this is a primary image, make all other images non-primary
    if (data.isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId: data.productId },
        data: { isPrimary: false },
      });
    }

    const image = await prisma.productImage.create({
      data,
    });

    return {
      ...image,
      fullUrl: this.formatImageUrl(image.imageUrl),
    };
  }

  /**
   * Update product image
   */
  static async updateImage(
    id: string,
    data: UpdateProductImageData,
  ): Promise<ProductImageWithUrl> {
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

    const updatedImage = await prisma.productImage.update({
      where: { id },
      data,
    });

    return {
      ...updatedImage,
      fullUrl: this.formatImageUrl(updatedImage.imageUrl),
    };
  }

  /**
   * Delete product image
   */
  static async deleteImage(id: string): Promise<void> {
    const image = await prisma.productImage.findUnique({
      where: { id },
    });

    await prisma.productImage.delete({
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
  }

  /**
   * Get paginated products with filters and sorting
   */
  static async getPaginated(
    params: ProductPaginationParams,
  ): Promise<PaginatedProductResponse> {
    const {
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
    } = params;

    // Build where clause
    const where: ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { skuCode: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (isActive !== undefined) where.isActive = isActive;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Build order by
    const orderBy: ProductOrderByInput = {};
    if (sortField.includes('.')) {
      const [relation, field] = sortField.split('.');
      orderBy[relation] = { [field]: sortDirection };
    } else {
      orderBy[sortField] = sortDirection;
    }

    // Execute query
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

    // Process products
    const processedProducts: ProductListItem[] = products.map((product) => ({
      ...product,
      primaryImage: product.images?.[0]?.imageUrl || null,
      batchCount: product._count?.batches || 0,
      batches: undefined, // Remove batches from list view for performance
    })) as ProductListItem[];

    return {
      products: processedProducts,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  }

  /**
   * Search products with pagination
   */
  static async search(
    params: ProductSearchParams,
  ): Promise<PaginatedProductResponse> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortDirection = 'asc',
      query = '',
      categoryId,
      brandId,
      isActive,
      minPrice,
      maxPrice,
    } = params;

    return this.getPaginated({
      page,
      pageSize: limit,
      sortField: sortBy,
      sortDirection,
      search: query,
      categoryId,
      brandId,
      isActive,
      minPrice,
      maxPrice,
    });
  }

  /**
   * Get product images for a specific product
   */
  static async getProductImages(
    productId: string,
  ): Promise<ProductImageWithUrl[]> {
    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });

    return images.map((image) => ({
      ...image,
      fullUrl: this.formatImageUrl(image.imageUrl),
    }));
  }

  /**
   * Set primary product image
   */
  static async setPrimaryImage(
    imageId: string,
    productId: string,
  ): Promise<ProductImageWithUrl> {
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
    const updatedImage = await prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });

    return {
      ...updatedImage,
      fullUrl: this.formatImageUrl(updatedImage.imageUrl),
    };
  }

  /**
   * Get filtered products for transactions/POS
   */
  static async getProductFiltered(
    options: ProductFilterOptions = {},
  ): Promise<ProductForTransaction[]> {
    const {
      search,
      exactId,
      take = 10,
      categoryId,
      brandId,
      isActive = true,
    } = options;

    // Build where conditions
    const whereConditions: ProductWhereInput = {
      isActive,
    };

    if (exactId) {
      whereConditions.id = exactId;
    } else if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) whereConditions.categoryId = categoryId;
    if (brandId) whereConditions.brandId = brandId;

    const products = await prisma.product.findMany({
      where: whereConditions,
      include: {
        batches: {
          where: {
            remainingQuantity: { gt: 0 },
          },
          orderBy: {
            expiryDate: 'asc',
          },
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
      take,
    });

    return products as ProductForTransaction[];
  }

  /**
   * Count products with where clause
   */
  static async countWithWhere(where?: ProductWhereInput): Promise<number> {
    return prisma.product.count({ where });
  }

  /**
   * Get products with custom options
   */
  static async getProductsWithOptions(
    params: GetProductsWithOptionsParams,
  ): Promise<ProductWithRelations[]> {
    const { where, orderBy, skip, take, include } = params;

    const defaultInclude = {
      category: true,
      brand: true,
      unit: true,
      images: true,
    };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: include || defaultInclude,
    });

    return products as ProductWithRelations[];
  }

  /**
   * Check if product has batches
   */
  static async hasBatches(id: string): Promise<boolean> {
    const count = await prisma.productBatch.count({
      where: { productId: id },
    });
    return count > 0;
  }

  /**
   * Check if product is in use (has transaction items)
   */
  static async isInUse(id: string): Promise<boolean> {
    const count = await prisma.transactionItem.count({
      where: {
        batch: {
          productId: id,
        },
      },
    });
    return count > 0;
  }

  /**
   * Helper method to format image URL with optimization parameters
   */
  private static formatImageUrl(imageUrl: string): string {
    if (imageUrl.includes('cloudinary.com')) {
      return imageUrl.replace('/upload/', '/upload/f_auto,q_auto/');
    }
    return imageUrl;
  }
}
