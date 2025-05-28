import prisma from '@/lib/prisma';
import {
  CreateBrandData,
  UpdateBrandData,
  BrandSearchParams,
  PaginatedBrandResponse,
  BrandWithCount,
  BrandWhereInput,
  BrandOrderByInput,
  GetBrandsWithCountParams,
} from '@/lib/types/brand';

export class BrandService {
  /**
   * Get all brands
   */
  static async getAll(): Promise<BrandWithCount[]> {
    return prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }) as Promise<BrandWithCount[]>;
  }

  /**
   * Get all brands with product count, paginated, sorted, filtered
   */
  static async getAllBrandsWithCount(
    params: GetBrandsWithCountParams,
  ): Promise<BrandWithCount[]> {
    const { where, orderBy, skip, take } = params;

    return prisma.brand.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }) as Promise<BrandWithCount[]>;
  }

  /**
   * Count brands with where clause (for pagination)
   */
  static async countWithWhere(where?: BrandWhereInput): Promise<number> {
    return prisma.brand.count({ where });
  }

  /**
   * Search brands with pagination
   */
  static async search(
    params: BrandSearchParams,
  ): Promise<PaginatedBrandResponse> {
    const {
      query = '',
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortDirection = 'asc',
    } = params;

    const skip = (page - 1) * limit;

    const where: BrandWhereInput = {};

    if (query) {
      where.OR = [{ name: { contains: query, mode: 'insensitive' } }];
    }

    const orderBy: BrandOrderByInput = {
      [sortBy]: sortDirection,
    };

    const [brands, totalCount] = await Promise.all([
      this.getAllBrandsWithCount({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.countWithWhere(where),
    ]);

    return {
      brands,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  /**
   * Get a brand by ID
   */
  static async getById(id: string): Promise<BrandWithCount | null> {
    return prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }) as Promise<BrandWithCount | null>;
  }

  /**
   * Create a new brand
   */
  static async create(data: CreateBrandData): Promise<BrandWithCount> {
    return prisma.brand.create({
      data: {
        name: data.name,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }) as Promise<BrandWithCount>;
  }

  /**
   * Update a brand
   */
  static async update(
    id: string,
    data: UpdateBrandData,
  ): Promise<BrandWithCount> {
    return prisma.brand.update({
      where: { id },
      data: {
        name: data.name,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }) as Promise<BrandWithCount>;
  }

  /**
   * Delete a brand
   */
  static async delete(id: string): Promise<void> {
    await prisma.brand.delete({
      where: { id },
    });
  }

  /**
   * Check if a brand has associated products
   */
  static async hasProducts(id: string): Promise<boolean> {
    const count = await prisma.product.count({
      where: { brandId: id },
    });
    return count > 0;
  }
}
