import prisma from '@/lib/prisma';

export const CategoryService = {
  /**
   * Get all categories
   */
  async getAll() {
    return await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  },

  /**
   * Get all categories with product count
   */
  async getAllWithProductCount() {
    return await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },

  /**
   * Get all categories with product count, paginated, sorted, filtered
   */
  async getAllCategoriesWithCount({
    where,
    orderBy,
    skip,
    take,
  }: {
    where?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
  }) {
    return await prisma.category.findMany({
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
    });
  },

  /**
   * Count categories with where clause (for pagination)
   */
  async countWithWhere(where?: any) {
    return await prisma.category.count({ where });
  },

  /**
   * Get category by ID
   */
  async getById(id: string) {
    return await prisma.category.findUnique({
      where: { id },
    });
  },

  /**
   * Create a new category
   */
  async create(data: { name: string; description?: string }) {
    return await prisma.category.create({
      data,
    });
  },

  /**
   * Update a category
   */
  async update(id: string, data: { name?: string; description?: string }) {
    return await prisma.category.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a category
   */
  async delete(id: string) {
    return await prisma.category.delete({
      where: { id },
    });
  },

  /**
   * Check if a category has products
   */
  async hasProducts(id: string): Promise<boolean> {
    const count = await prisma.product.count({
      where: {
        categoryId: id,
      },
    });
    return count > 0;
  },
};
