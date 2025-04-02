import prisma from '@/lib/prisma';

export const UnitService = {
  /**
   * Get all units
   */
  async getAll() {
    return await prisma.unit.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  },

  /**
   * Get all units with counts of related entities
   */
  async getAllWithRelationCounts() {
    return await prisma.unit.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            productVariants: true,
            stockIns: true,
            stockOuts: true,
            transactionItems: true,
            fromUnitConversions: true,
            toUnitConversions: true,
          },
        },
      },
    });
  },

  /**
   * Get unit by ID
   */
  async getById(id: string) {
    return await prisma.unit.findUnique({
      where: { id },
    });
  },

  /**
   * Get unit with its conversions
   */
  async getWithConversions(id: string) {
    return await prisma.unit.findUnique({
      where: { id },
      include: {
        fromUnitConversions: {
          include: {
            toUnit: true,
          },
        },
        toUnitConversions: {
          include: {
            fromUnit: true,
          },
        },
      },
    });
  },

  /**
   * Create a new unit
   */
  async create(data: { name: string; symbol: string }) {
    return await prisma.unit.create({
      data,
    });
  },

  /**
   * Update a unit
   */
  async update(id: string, data: { name?: string; symbol?: string }) {
    return await prisma.unit.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a unit
   */
  async delete(id: string) {
    return await prisma.unit.delete({
      where: { id },
    });
  },

  /**
   * Check if a unit is used in any related entities
   */
  async isInUse(id: string): Promise<boolean> {
    const counts = await prisma.unit.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            productVariants: true,
            stockIns: true,
            stockOuts: true,
            transactionItems: true,
          },
        },
      },
    });

    if (!counts) return false;

    return (
      counts._count.productVariants > 0 ||
      counts._count.stockIns > 0 ||
      counts._count.stockOuts > 0 ||
      counts._count.transactionItems > 0
    );
  },

  /**
   * Create a unit conversion between two units
   */
  async createConversion(data: {
    fromUnitId: string;
    toUnitId: string;
    conversionFactor: number;
  }) {
    return await prisma.unitConversion.create({
      data: {
        fromUnitId: data.fromUnitId,
        toUnitId: data.toUnitId,
        conversionFactor: data.conversionFactor,
      },
      include: {
        fromUnit: true,
        toUnit: true,
      },
    });
  },

  /**
   * Update a unit conversion
   */
  async updateConversion(id: string, data: { conversionFactor: number }) {
    return await prisma.unitConversion.update({
      where: { id },
      data: {
        conversionFactor: data.conversionFactor,
      },
      include: {
        fromUnit: true,
        toUnit: true,
      },
    });
  },

  /**
   * Delete a unit conversion
   */
  async deleteConversion(id: string) {
    return await prisma.unitConversion.delete({
      where: { id },
    });
  },

  /**
   * Get all unit conversions
   */
  async getAllConversions() {
    return await prisma.unitConversion.findMany({
      include: {
        fromUnit: true,
        toUnit: true,
      },
      orderBy: {
        fromUnit: {
          name: 'asc',
        },
      },
    });
  },

  /**
   * Find existing conversion between two units
   */
  async findConversion(fromUnitId: string, toUnitId: string) {
    return await prisma.unitConversion.findFirst({
      where: {
        fromUnitId,
        toUnitId,
      },
      include: {
        fromUnit: true,
        toUnit: true,
      },
    });
  },
};
