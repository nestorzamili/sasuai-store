import { Supplier } from '@prisma/client';

/**
 * Supplier extended with stock-in counts
 */
export interface SupplierWithCount extends Supplier {
  _count?: {
    stockIns: number;
  };
}

/**
 * Supplier form input values
 */
export interface SupplierFormValues {
  name: string;
  contact?: string;
}

/**
 * Supplier with optional initial form data
 */
export interface SupplierFormInitialData extends Supplier {
  _count?: {
    stockIns: number;
  };
}
