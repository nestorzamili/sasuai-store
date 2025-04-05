import {
  StockIn,
  StockOut,
  Unit,
  Supplier,
  ProductBatch,
} from '@prisma/client';
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
 * Stock-out with related entities
 */
export interface StockOutComplete extends StockOut {
  batch: ProductBatchWithProduct;
  unit: Unit;
}

/**
 * Stock-in grouped by supplier
 */
export interface SupplierWithStockIns extends Supplier {
  stockIns: StockInComplete[];
}
