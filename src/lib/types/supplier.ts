import { Supplier } from '@prisma/client';
import { StockInComplete } from './stock-movement';

/**
 * Supplier with stock-in count
 */
export interface SupplierWithCount extends Supplier {
  _count: {
    stockIns: number;
  };
}

/**
 * Supplier with stock-in history
 */
export interface SupplierWithStockIns extends Supplier {
  stockIns: StockInComplete[];
}

/**
 * Supplier form input values
 */
export interface SupplierFormValues {
  name: string;
  contact?: string;
}

/**
 * Form initial data for suppliers
 */
export interface SupplierFormInitialData {
  id: string;
  name: string;
  contact?: string | null;
  _count?: {
    stockIns: number;
  };
}
