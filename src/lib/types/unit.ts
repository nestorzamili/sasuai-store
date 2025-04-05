import { Unit, UnitConversion } from '@prisma/client';

/**
 * Count metrics for unit relationships
 */
export interface UnitCount {
  productVariants?: number;
  stockIns?: number;
  stockOuts?: number;
  transactionItems?: number;
  fromUnitConversions?: number;
  toUnitConversions?: number;
}

/**
 * Unit with relationship counts
 */
export interface UnitWithCounts extends Unit {
  _count?: UnitCount;
}

/**
 * Unit conversion with related units
 */
export interface UnitConversionWithUnits extends UnitConversion {
  fromUnit: Unit;
  toUnit: Unit;
}
