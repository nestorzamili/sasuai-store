import { SortOption } from './table';

/**
 * Base Supplier type from database schema
 */
export interface Supplier {
  id: string;
  name: string;
  contact: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Basic product batch type needed for stock-in relations
 */
interface ProductBatch {
  id: string;
  productId: string;
  batchCode: string;
  expiryDate: Date;
  initialQuantity: number;
  remainingQuantity: number;
  buyPrice: number;
  product: {
    id: string;
    name: string;
  };
}

/**
 * Basic unit type needed for stock-in relations
 */
interface Unit {
  id: string;
  name: string;
  symbol: string;
}

/**
 * Stock-in record for supplier details
 */
export interface StockInRecord {
  id: string;
  batchId: string;
  quantity: number;
  unitId: string;
  date: Date;
  supplierId: string | null;
  batch: ProductBatch;
  unit: Unit;
}

/**
 * Supplier with counts of related records
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
  stockIns: StockInRecord[];
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

/**
 * Supplier where filter condition
 */
export interface SupplierWhereInput {
  OR?: Array<{
    [key: string]: { contains: string; mode: string };
  }>;
  [key: string]: unknown;
}

/**
 * Supplier query order by input
 */
export interface SupplierOrderByInput {
  [key: string]: 'asc' | 'desc';
}

/**
 * Supplier sort option - Compatible with SortByOptions from useFetch
 */
export interface SupplierSortOption {
  id: string;
  desc: boolean;
}

/**
 * TableFetchOptions compatible sorting type
 */
export type SupplierSortByOptions = SupplierSortOption[];

/**
 * Supplier query options for table
 */
export interface SupplierOptions {
  page?: number;
  limit?: number;
  sortBy?: SortOption;
  search?: string;
  columnFilter?: string[];
}

/**
 * Supplier service query parameters
 */
export interface SupplierQueryParams {
  where?: SupplierWhereInput;
  orderBy?: SupplierOrderByInput;
  skip?: number;
  take?: number;
}
