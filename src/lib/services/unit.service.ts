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

  /**
   * Get all unit conversions
   */
  static async getAllConversions() {
    return prisma.unitConversion.findMany({
      include: {
        fromUnit: true,
        toUnit: true,
      },
      orderBy: { fromUnit: { name: 'asc' } },
    });
  }

  /**
   * Get unit conversion by ID
   */
  static async getConversionById(id: string) {
    return prisma.unitConversion.findUnique({
      where: { id },
      include: {
        fromUnit: true,
        toUnit: true,
      },
    });
  }

  /**
   * Get conversions for a specific unit (as source unit)
   */
  static async getConversionsFromUnit(unitId: string) {
    return prisma.unitConversion.findMany({
      where: { fromUnitId: unitId },
      include: {
        toUnit: true,
      },
      orderBy: { toUnit: { name: 'asc' } },
    });
  }

  /**
   * Get conversions to a specific unit (as target unit)
   */
  static async getConversionsToUnit(unitId: string) {
    return prisma.unitConversion.findMany({
      where: { toUnitId: unitId },
      include: {
        fromUnit: true,
      },
      orderBy: { fromUnit: { name: 'asc' } },
    });
  }

  /**
   * Create a new unit conversion
   */
  static async createConversion(data: {
    fromUnitId: string;
    toUnitId: string;
    conversionFactor: number;
  }) {
    // Validate that the units exist
    const [fromUnit, toUnit] = await Promise.all([
      this.getById(data.fromUnitId),
      this.getById(data.toUnitId),
    ]);

    if (!fromUnit || !toUnit) {
      throw new Error('One or both units do not exist');
    }

    // Check for existing conversion
    const existingConversion = await prisma.unitConversion.findFirst({
      where: {
        fromUnitId: data.fromUnitId,
        toUnitId: data.toUnitId,
      },
    });

    if (existingConversion) {
      throw new Error('A conversion between these units already exists');
    }

    return prisma.unitConversion.create({
      data,
      include: {
        fromUnit: true,
        toUnit: true,
      },
    });
  }

  /**
   * Update a unit conversion
   */
  static async updateConversion(
    id: string,
    data: { conversionFactor: number },
  ) {
    return prisma.unitConversion.update({
      where: { id },
      data,
      include: {
        fromUnit: true,
        toUnit: true,
      },
    });
  }

  /**
   * Delete a unit conversion
   */
  static async deleteConversion(id: string) {
    return prisma.unitConversion.delete({
      where: { id },
    });
  }

  /**
   * Convert quantity from one unit to another
   */
  static async convertQuantity(
    fromUnitId: string,
    toUnitId: string,
    quantity: number,
  ) {
    // If units are the same, no conversion needed
    if (fromUnitId === toUnitId) {
      return quantity;
    }

    // Try to find direct conversion
    const directConversion = await prisma.unitConversion.findFirst({
      where: {
        fromUnitId,
        toUnitId,
      },
    });

    if (directConversion) {
      return quantity * directConversion.conversionFactor;
    }

    // Try to find reverse conversion
    const reverseConversion = await prisma.unitConversion.findFirst({
      where: {
        fromUnitId: toUnitId,
        toUnitId: fromUnitId,
      },
    });

    if (reverseConversion) {
      return quantity / reverseConversion.conversionFactor;
    }

    throw new Error(`No conversion found between the specified units`);
  }
}
