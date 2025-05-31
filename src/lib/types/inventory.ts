// Base entity interfaces
export interface Product {
  id: string;
  name: string;
  categoryId: string;
  brandId?: string | null;
  description?: string | null;
  unitId: string;
  cost: number;
  price: number;
  currentStock: number;
  skuCode?: string | null;
  barcode?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductBatch {
  id: string;
  productId: string;
  batchCode: string;
  expiryDate: Date;
  initialQuantity: number;
  remainingQuantity: number;
  buyPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  batchId: string;
  quantity: number;
  unitId: string;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  finalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced interfaces with relationships
export interface ProductWithDetails extends Product {
  category?: Category | null;
  unit?: Unit;
}

export interface ProductBatchWithProduct extends ProductBatch {
  product: ProductWithDetails;
}

export interface StockInComplete extends StockIn {
  batch: ProductBatchWithProduct;
  supplier: Supplier | null;
  unit: Unit;
}

export interface StockOutComplete extends StockOut {
  batch: ProductBatchWithProduct;
  unit: Unit;
}

export interface ProductBatchWithDetails extends ProductBatch {
  product: ProductWithDetails;
  stockIns: StockInComplete[];
  stockOuts: StockOutComplete[];
  transactionItems: TransactionItemWithRelations[];
}

export interface TransactionItemWithRelations extends TransactionItem {
  unit: Unit;
  transaction: {
    id: string;
    createdAt: Date;
    finalAmount: number;
  };
}

// Stock movement types (consolidated from stock-movement.ts)
export type StockMovementType = 'IN' | 'OUT';

export interface StockIn {
  id: string;
  batchId: string;
  quantity: number;
  unitId: string;
  date: Date;
  supplierId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockOut {
  id: string;
  batchId: string;
  quantity: number;
  unitId: string;
  date: Date;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  date: Date;
  type: StockMovementType;
  quantity: number;
  batchId: string;
  reason?: string | null;
  supplier: Supplier | null;
  unit: Unit;
  batch?: ProductBatchWithProduct;
}

// Add new interface for transaction-based stock out
export interface TransactionStockOut {
  id: string;
  batchId: string;
  quantity: number;
  unitId: string;
  date: Date;
  reason: string; // Will be "TRANSACTION"
  transactionId?: string;
  transactionItemId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Unified stock out type that can represent both manual stock outs and transaction-based ones
export interface UnifiedStockOut {
  id: string;
  batchId: string;
  quantity: number;
  unitId: string;
  date: Date;
  reason: string;
  type: 'MANUAL' | 'TRANSACTION';
  transactionId?: string;
  transactionItemId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockOutComplete extends StockOut {
  batch: ProductBatchWithProduct;
  unit: Unit;
}

// Add new complete type for unified stock outs
export interface UnifiedStockOutComplete extends UnifiedStockOut {
  batch: ProductBatchWithProduct;
  unit: Unit;
  transaction?: {
    id: string;
    tranId: string | null;
    cashier?: {
      name: string | null;
    };
  };
}

// Stock movement creation types
export interface CreateStockInData {
  batchId: string;
  quantity: number;
  unitId: string;
  date: Date;
  supplierId?: string;
}

export interface CreateStockOutData {
  batchId: string;
  quantity: number;
  unitId: string;
  date: Date;
  reason: string;
}

// Stock movement search parameters
export interface StockMovementSearchParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  columnFilter?: string[];
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  batchId?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Array<{
    code: string;
    expected?: unknown;
    received?: unknown;
    path: (string | number)[];
    message: string;
  }>;
}

export interface PaginationMeta {
  totalRows: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Specific API response types
export type GetBatchesResponse = ApiResponse<
  PaginatedResponse<ProductBatchWithProduct>
>;
export type GetBatchResponse = ApiResponse<ProductBatchWithDetails>;
export type CreateBatchResponse = ApiResponse<{
  batch: ProductBatch;
  stockIn: StockIn;
}>;
export type UpdateBatchResponse = ApiResponse<ProductBatch>;
export type DeleteBatchResponse = ApiResponse<void>;
export type AdjustQuantityResponse = ApiResponse<ProductBatch>;

// API Response types for stock movements
export type GetStockMovementsResponse = ApiResponse<
  PaginatedResponse<StockInComplete | StockOutComplete>
>;
export type GetStockMovementHistoryResponse = ApiResponse<StockMovement[]>;
export type CreateStockInResponse = ApiResponse<StockInComplete>;
export type CreateStockOutResponse = ApiResponse<StockOutComplete>;

// API Response types for units and suppliers - match actual paginated implementation
export type GetUnitsResponse = ApiResponse<Unit[] | PaginatedResponse<Unit>>;
export type GetSuppliersResponse = ApiResponse<
  Supplier[] | PaginatedResponse<Supplier>
>;
export type GetProductsResponse = ApiResponse<Product[]>;

// Utility types for handling flexible response structures
export type FlexibleApiResponse<T> = ApiResponse<
  T | PaginatedResponse<T extends (infer U)[] ? U : never>
>;

// Type guards for response structure
export function isPaginatedResponse<T>(
  data: unknown,
): data is PaginatedResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    'meta' in data &&
    Array.isArray((data as PaginatedResponse<T>).data)
  );
}

// Safe utility functions that handle any response structure
export function extractUnitsArray(data: unknown): Unit[] {
  // Handle direct array
  if (Array.isArray(data)) {
    return data;
  }

  // Handle paginated response with data property
  if (data && typeof data === 'object' && 'data' in data) {
    const paginatedData = (data as { data: unknown }).data;
    if (Array.isArray(paginatedData)) {
      return paginatedData;
    }
  }

  // Fallback
  return [];
}

export function extractSuppliersArray(data: unknown): Supplier[] {
  // Handle direct array
  if (Array.isArray(data)) {
    return data;
  }

  // Handle paginated response with data property
  if (data && typeof data === 'object' && 'data' in data) {
    const paginatedData = (data as { data: unknown }).data;
    if (Array.isArray(paginatedData)) {
      return paginatedData;
    }
  }

  // Fallback
  return [];
}

export function extractProductsArray(data: Product[]): Product[] {
  return Array.isArray(data) ? data : [];
}

// Generic utility function (keeping for backward compatibility)
export function extractArrayFromResponse<T>(
  data: T[] | PaginatedResponse<T>,
): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (isPaginatedResponse<T>(data)) {
    return data.data;
  }
  return [];
}

// Table fetch options - more specific types
export interface TableFetchOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: { id: string; desc: boolean };
  filters?: Record<string, string | number | boolean | null | undefined>;
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  sorting?: Array<{
    id: string;
    desc: boolean;
  }>;
  columnFilters?: Array<{
    id: string;
    value: unknown;
  }>;
  [key: string]: unknown;
}

export interface TableFetchResult<T = unknown> {
  data: T;
  totalRows: number;
  pagination?: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  [key: string]: unknown;
}

// Form initial data types
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

// Filter types for batch table - simplified to match useFetch expectations
export interface BatchFilters {
  expiryDateStart?: string; // ISO date string instead of Date object
  expiryDateEnd?: string; // ISO date string instead of Date object
  minQuantity?: number;
  maxQuantity?: number;
  includeExpired?: boolean;
  includeOutOfStock?: boolean;
  categoryId?: string;
}

// Loading states
export interface LoadingStates {
  batches: boolean;
  stockIn: boolean;
  stockOut: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  adjust: boolean;
}

// Dialog states
export interface DialogStates {
  create: boolean;
  edit: boolean;
  delete: boolean;
  detail: boolean;
  adjust: boolean;
}

// Batch pagination parameters for API calls
export interface BatchPaginationParams {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  productId?: string; // Add this missing property
  expiryDateStart?: Date;
  expiryDateEnd?: Date;
  minRemainingQuantity?: number;
  maxRemainingQuantity?: number;
  includeExpired?: boolean;
  includeOutOfStock?: boolean;
  categoryId?: string;
}

// Batch creation and update types
export interface CreateBatchData {
  productId: string;
  batchCode: string;
  expiryDate: Date;
  initialQuantity: number;
  buyPrice: number;
  unitId: string;
  supplierId?: string | null;
}

export interface UpdateBatchData {
  batchCode?: string;
  expiryDate?: Date;
  buyPrice?: number;
}

export interface AdjustQuantityData {
  adjustment: number;
  reason: string;
  unitId: string;
}
