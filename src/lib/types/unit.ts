import { Unit } from './base-types';

/**
 * Unit with counts of related records
 */
export interface UnitWithCounts extends Unit {
  _count?: {
    products?: number;
    stockIns?: number;
    stockOuts?: number;
    productBatches?: number;
    transactionItems?: number;
    fromUnitConversions?: number;
    toUnitConversions?: number;
  };
}

export interface UnitConversionWithUnits {
  id: string;
  fromUnit: Unit;
  toUnit: Unit;
  conversionFactor: number;
  createdAt: Date;
  updatedAt: Date;
}
