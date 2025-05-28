import prisma from '@/lib/prisma';
import {
  CreateCategoryData,
  UpdateCategoryData,
  CategorySearchParams,
  PaginatedCategoryResponse,
  CategoryWithCount,
  CategoryWhereInput,
  CategoryOrderByInput,
  GetCategoriesWithCountParams,
} from '@/lib/types/category';

export class CategoryService {
  /**
   * Get all categories
   */
  static async getAll(): Promise<CategoryWithCount[]> {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }) as Promise<CategoryWithCount[]>;
  }

  /**
   * Get all categories with product count
   */
  static async getAllWithProductCount(): Promise<CategoryWithCount[]> {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }) as Promise<CategoryWithCount[]>;
  }

  /**
   * Get all categories with product count, paginated, sorted, filtered
   */
  static async getAllCategoriesWithCount(
    params: GetCategoriesWithCountParams,
  ): Promise<CategoryWithCount[]> {
    const { where, orderBy, skip, take } = params;

    return prisma.category.findMany({
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
    }) as Promise<CategoryWithCount[]>;
  }

  /**
   * Count categories with where clause (for pagination)
   */
  static async countWithWhere(where?: CategoryWhereInput): Promise<number> {
    return prisma.category.count({ where });
  }

  /**
   * Search categories with pagination
   */
  static async search(
    params: CategorySearchParams,
  ): Promise<PaginatedCategoryResponse> {
    const {
      query = '',
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortDirection = 'asc',
    } = params;

    const skip = (page - 1) * limit;

    const where: CategoryWhereInput = {};

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const orderBy: CategoryOrderByInput = {
      [sortBy]: sortDirection,
    };

    const [categories, totalCount] = await Promise.all([
      this.getAllCategoriesWithCount({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.countWithWhere(where),
    ]);

    return {
      categories,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  /**
   * Get category by ID
   */
  static async getById(id: string): Promise<CategoryWithCount | null> {
    return prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }) as Promise<CategoryWithCount | null>;
  }

  /**
   * Create a new category
   */
  static async create(data: CreateCategoryData): Promise<CategoryWithCount> {
    return prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }) as Promise<CategoryWithCount>;
  }

  /**
   * Update a category
   */
  static async update(
    id: string,
    data: UpdateCategoryData,
  ): Promise<CategoryWithCount> {
    return prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }) as Promise<CategoryWithCount>;
  }

  /**
   * Delete a category
   */
  static async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Check if a category has products
   */
  static async hasProducts(id: string): Promise<boolean> {
    const count = await prisma.product.count({
      where: { categoryId: id },
    });
    return count > 0;
  }
}
