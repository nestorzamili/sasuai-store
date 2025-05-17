import {
  Product,
  ProductBatch,
  StockIn,
  StockOut,
  TransactionItem,
  Unit,
  Supplier,
  Category,
} from './base-types';

/**
 * Product batch with its product
 */
export interface ProductBatchWithProduct extends ProductBatch {
  product: Product;
  remainingQuantity: number;
}

/**
 * Product batch with stock movements
 */
export interface ProductBatchWithStockMovements extends ProductBatch {
  stockIns: StockIn[];
  stockOuts: StockOut[];
  transactionItems: TransactionItem[];
}

/**
 * Enhanced Product with category and unit
 */
export interface ProductWithDetails extends Product {
  category?: Category | null;
  unit?: Unit;
}

/**
 * Enhanced Stock In with related entities
 */
export interface StockInWithRelations extends StockIn {
  unit: Unit;
  supplier?: Supplier | null;
}

/**
 * Enhanced Stock Out with related entities
 */
export interface StockOutWithRelations extends StockOut {
  unit: Unit;
}

/**
 * Enhanced Transaction Item with related entities
 */
export interface TransactionItemWithRelations extends TransactionItem {
  unit: Unit;
  transaction: {
    id: string;
    createdAt: Date;
    finalAmount: number;
  };
}

/**
 * Product batch with detailed product and stock movements
 */
export interface ProductBatchWithDetails extends ProductBatch {
  product: ProductWithDetails;
  stockIns: StockInWithRelations[];
  stockOuts: StockOutWithRelations[];
  transactionItems: TransactionItemWithRelations[];
  expiryDate: Date;
  batchCode: string;
  remainingQuantity: number;
}

/**
 * Available product batch for transactions
 */
export interface AvailableProductBatch extends ProductBatch {
  product: Product & {
    category?: Category | null;
    unit?: Unit;
  };
  availableQuantity: number;
  unit: Unit;
}

/**
 * Stock movement type
 */
export type StockMovementType = 'IN' | 'OUT';

/**
 * Combined stock movement record
 */
export interface StockMovement {
  id: string;
  date: Date;
  type: StockMovementType;
  quantity: number;
  batchId: string;
  batchCode?: string;
  reason?: string | null;
  supplier?: Supplier | null;
  unit: Unit;
}

/**
 * Batch creation result
 */
export interface BatchCreationResult {
  batch: ProductBatch;
  stockIn: StockIn;
}

/**
 * Product batch form values
 */
export interface ProductBatchFormValues {
  productId: string;
  batchCode: string;
  expiryDate: Date;
  initialQuantity: number;
  buyPrice: number;
  unitId: string;
  supplierId?: string;
}

/**
 * Form initial data for product batch form
 */
export interface ProductBatchFormInitialData {
  id?: string;
  productId: string;
  batchCode: string;
  expiryDate: Date;
  initialQuantity: number;
  buyPrice: number;
  unitId: string;
  supplierId?: string;
}

/**
 * Pagination parameters for product batches
 */
export interface BatchPaginationParams {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  productId?: string;
  expiryDateStart?: Date | string;
  expiryDateEnd?: Date | string;
  minRemainingQuantity?: number | string;
  maxRemainingQuantity?: number | string;
  includeExpired?: boolean | string;
  includeOutOfStock?: boolean | string;
  categoryId?: string;
}
