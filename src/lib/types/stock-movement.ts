import { ProductBatch, StockIn, StockOut, Unit, Supplier } from './base-types';
import { ProductBatchWithProduct } from './product-batch';

/**
 * Stock-in with related entities
 */
export interface StockInComplete extends StockIn {
  batch: ProductBatchWithProduct;
  supplier: Supplier | null;
  unit: Unit;
}

/**
 * Enhanced stock out record with batch and unit
 */
export interface StockOutComplete extends StockOut {
  batch: {
    id: string;
    batchCode: string;
    product: {
      id: string;
      name: string;
    };
  };
  unit: Unit;
  transactionId?: string; // For transaction-related stock reductions
}

/**
 * Combined stock movement record (for transaction items and manual stock outs)
 */
export interface StockMovement {
  id: string;
  batchId: string;
  quantity: number;
  unitId: string;
  date: Date;
  reason?: string | null;
  unit: Unit;
  batch?: {
    batchCode: string;
    product: {
      name: string;
    };
  };
  transactionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  source: 'transaction' | 'manual';
}

/**
 * Stock-in grouped by supplier
 */
export interface SupplierWithStockIns extends Supplier {
  stockIns: StockInComplete[];
}
