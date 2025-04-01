import prisma from '@/lib/prisma';

export class BrandService {
  /**
   * Get all brands
   */
  static async getAll() {
    return prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get all brands with product count
   */
  static async getAllWithProductCount() {
    return prisma.brand.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get a brand by ID
   */
  static async getById(id: string) {
    return prisma.brand.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new brand
   */
  static async create(data: { name: string; description?: string | null }) {
    return prisma.brand.create({
      data,
    });
  }

  /**
   * Update a brand
   */
  static async update(
    id: string,
    data: { name?: string; description?: string | null },
  ) {
    return prisma.brand.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a brand
   */
  static async delete(id: string) {
    return prisma.brand.delete({
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
