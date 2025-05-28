import prisma from '@/lib/prisma';
import {
  CreateUnitData,
  UpdateUnitData,
  CreateUnitConversionData,
  UpdateUnitConversionData,
  UnitSearchParams,
  UnitConversionSearchParams,
  PaginatedUnitResponse,
  PaginatedUnitConversionResponse,
  UnitWithCounts,
  UnitConversionWithUnits,
  UnitWhereInput,
  UnitConversionWhereInput,
  UnitOrderByInput,
  UnitConversionOrderByInput,
  GetUnitsWithCountsParams,
  GetConversionsParams,
  ConversionForUnit,
} from '@/lib/types/unit';

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
  static async getAllWithRelationCounts(): Promise<UnitWithCounts[]> {
    const units = await prisma.unit.findMany({
      include: {
        _count: {
          select: {
            products: true,
            stockIns: true,
            stockOuts: true,
            transactionItems: true,
            fromUnitConversions: true,
            toUnitConversions: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return units.map((unit) => ({
      ...unit,
      _count: {
        products: unit._count.products ?? 0,
        stockIns: unit._count.stockIns ?? 0,
        stockOuts: unit._count.stockOuts ?? 0,
        transactionItems: unit._count.transactionItems ?? 0,
        fromUnitConversions: unit._count.fromUnitConversions ?? 0,
        toUnitConversions: unit._count.toUnitConversions ?? 0,
      },
    })) as UnitWithCounts[];
  }

  /**
   * Get all units with relation counts, paginated, sorted, filtered
   */
  static async getAllUnitsWithCounts(
    params: GetUnitsWithCountsParams,
  ): Promise<UnitWithCounts[]> {
    const { where, orderBy, skip, take } = params;

    const units = await prisma.unit.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        _count: {
          select: {
            products: true,
            stockIns: true,
            stockOuts: true,
            transactionItems: true,
            fromUnitConversions: true,
            toUnitConversions: true,
          },
        },
      },
    });

    return units.map((unit) => ({
      ...unit,
      _count: {
        products: unit._count.products ?? 0,
        stockIns: unit._count.stockIns ?? 0,
        stockOuts: unit._count.stockOuts ?? 0,
        transactionItems: unit._count.transactionItems ?? 0,
        fromUnitConversions: unit._count.fromUnitConversions ?? 0,
        toUnitConversions: unit._count.toUnitConversions ?? 0,
      },
    })) as UnitWithCounts[];
  }

  /**
   * Count units with where clause (for pagination)
   */
  static async countWithWhere(where?: UnitWhereInput): Promise<number> {
    return prisma.unit.count({ where });
  }

  /**
   * Search units with pagination
   */
  static async search(
    params: UnitSearchParams,
  ): Promise<PaginatedUnitResponse> {
    const {
      query = '',
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortDirection = 'asc',
    } = params;

    const skip = (page - 1) * limit;

    const where: UnitWhereInput = {};

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { symbol: { contains: query, mode: 'insensitive' } },
      ];
    }

    const orderBy: UnitOrderByInput = {
      [sortBy]: sortDirection,
    };

    const [units, totalCount] = await Promise.all([
      this.getAllUnitsWithCounts({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.countWithWhere(where),
    ]);

    return {
      units,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
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
  static async create(data: CreateUnitData) {
    return prisma.unit.create({
      data,
    });
  }

  /**
   * Update a unit
   */
  static async update(id: string, data: UpdateUnitData) {
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
  static async getAllConversions(): Promise<UnitConversionWithUnits[]> {
    return prisma.unitConversion.findMany({
      include: {
        fromUnit: true,
        toUnit: true,
      },
      orderBy: { fromUnit: { name: 'asc' } },
    }) as Promise<UnitConversionWithUnits[]>;
  }

  /**
   * Get all unit conversions with pagination, sorting, and filtering
   */
  static async getAllConversionsWithOptions(
    params: GetConversionsParams,
  ): Promise<UnitConversionWithUnits[]> {
    const { where, orderBy, skip, take } = params;

    return prisma.unitConversion.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        fromUnit: true,
        toUnit: true,
      },
    }) as Promise<UnitConversionWithUnits[]>;
  }

  /**
   * Count conversions with where clause (for pagination)
   */
  static async countConversionsWithWhere(
    where?: UnitConversionWhereInput,
  ): Promise<number> {
    return prisma.unitConversion.count({ where });
  }

  /**
   * Search unit conversions with pagination
   */
  static async searchConversions(
    params: UnitConversionSearchParams,
  ): Promise<PaginatedUnitConversionResponse> {
    const {
      query = '',
      page = 1,
      limit = 10,
      sortBy = 'fromUnit',
      sortDirection = 'asc',
    } = params;

    const skip = (page - 1) * limit;

    const where: UnitConversionWhereInput = {};

    if (query) {
      where.OR = [
        { fromUnit: { name: { contains: query, mode: 'insensitive' } } },
        { fromUnit: { symbol: { contains: query, mode: 'insensitive' } } },
        { toUnit: { name: { contains: query, mode: 'insensitive' } } },
        { toUnit: { symbol: { contains: query, mode: 'insensitive' } } },
      ];
    }

    let orderBy: UnitConversionOrderByInput = {};
    if (sortBy === 'fromUnit') {
      orderBy = { fromUnit: { name: sortDirection } };
    } else if (sortBy === 'toUnit') {
      orderBy = { toUnit: { name: sortDirection } };
    } else {
      orderBy[sortBy] = sortDirection;
    }

    const [conversions, totalCount] = await Promise.all([
      this.getAllConversionsWithOptions({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.countConversionsWithWhere(where),
    ]);

    return {
      conversions,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  /**
   * Get unit conversion by ID
   */
  static async getConversionById(
    id: string,
  ): Promise<UnitConversionWithUnits | null> {
    return prisma.unitConversion.findUnique({
      where: { id },
      include: {
        fromUnit: true,
        toUnit: true,
      },
    }) as Promise<UnitConversionWithUnits | null>;
  }

  /**
   * Get conversions for a specific unit (as source unit)
   */
  static async getConversionsFromUnit(
    unitId: string,
  ): Promise<UnitConversionWithUnits[]> {
    return prisma.unitConversion.findMany({
      where: { fromUnitId: unitId },
      include: {
        fromUnit: true,
        toUnit: true,
      },
      orderBy: { toUnit: { name: 'asc' } },
    }) as Promise<UnitConversionWithUnits[]>;
  }

  /**
   * Get conversions to a specific unit (as target unit)
   */
  static async getConversionsToUnit(
    unitId: string,
  ): Promise<UnitConversionWithUnits[]> {
    return prisma.unitConversion.findMany({
      where: { toUnitId: unitId },
      include: {
        fromUnit: true,
        toUnit: true,
      },
      orderBy: { fromUnit: { name: 'asc' } },
    }) as Promise<UnitConversionWithUnits[]>;
  }

  /**
   * Get conversions for a specific unit (both directions)
   */
  static async getConversionsForUnit(
    unitId: string,
  ): Promise<ConversionForUnit> {
    const [fromConversions, toConversions] = await Promise.all([
      this.getConversionsFromUnit(unitId),
      this.getConversionsToUnit(unitId),
    ]);

    return {
      fromConversions,
      toConversions,
    };
  }

  /**
   * Create a new unit conversion
   */
  static async createConversion(
    data: CreateUnitConversionData,
  ): Promise<UnitConversionWithUnits> {
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
    }) as Promise<UnitConversionWithUnits>;
  }

  /**
   * Update a unit conversion
   */
  static async updateConversion(
    id: string,
    data: UpdateUnitConversionData,
  ): Promise<UnitConversionWithUnits> {
    return prisma.unitConversion.update({
      where: { id },
      data,
      include: {
        fromUnit: true,
        toUnit: true,
      },
    }) as Promise<UnitConversionWithUnits>;
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
  ): Promise<number> {
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
      // Handle Prisma Decimal type
      const factor =
        typeof directConversion.conversionFactor === 'number'
          ? directConversion.conversionFactor
          : Number(directConversion.conversionFactor);
      return quantity * factor;
    }

    // Try to find reverse conversion
    const reverseConversion = await prisma.unitConversion.findFirst({
      where: {
        fromUnitId: toUnitId,
        toUnitId: fromUnitId,
      },
    });

    if (reverseConversion) {
      // Handle Prisma Decimal type
      const factor =
        typeof reverseConversion.conversionFactor === 'number'
          ? reverseConversion.conversionFactor
          : Number(reverseConversion.conversionFactor);
      return quantity / factor;
    }

    throw new Error(`No conversion found between the specified units`);
  }
}
