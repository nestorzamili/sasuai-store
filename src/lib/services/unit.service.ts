import prisma from '@/lib/prisma';

export class UnitService {
  /**
   * Get all units
   */
  static async getAll() {
    return prisma.unit.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get all units with relation counts
   */
  static async getAllWithRelationCounts() {
    return prisma.unit.findMany({
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
   * Get a unit by ID
   */
  static async getById(id: string) {
    return prisma.unit.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new unit
   */
  static async create(data: { name: string; symbol: string }) {
    return prisma.unit.create({
      data,
    });
  }

  /**
   * Update a unit
   */
  static async update(id: string, data: { name?: string; symbol?: string }) {
    return prisma.unit.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a unit
   */
  static async delete(id: string) {
    // Check if unit is in use
    const inUse = await this.isInUse(id);

    if (inUse) {
      throw new Error('Cannot delete a unit that is in use');
    }

    return prisma.unit.delete({
      where: { id },
    });
  }

  /**
   * Check if a unit is in use
   */
  static async isInUse(id: string): Promise<boolean> {
    const count = await prisma.product.count({
      where: { unitId: id },
    });

    return count > 0;
  }

  /**
   * Check if a unit has associated products
   */
  static async hasProducts(id: string): Promise<boolean> {
    const count = await prisma.product.count({
      where: { unitId: id },
    });
    return count > 0;
  }
}
