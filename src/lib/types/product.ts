// Base product interface
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

// Base interfaces for related entities
export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string | null;
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

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  isPrimary: boolean;
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

export interface Supplier {
  id: string;
  name: string;
  contact?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface Discount {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minPurchase?: number | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isGlobal: boolean;
  maxUses?: number | null;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Complex types with relationships
export interface ProductWithRelations extends Product {
  category: Category;
  brand: Brand | null;
  unit: Unit;
  images: ProductImage[];
  batches?: ProductBatch[];
  discounts?: Discount[];
  primaryImage?: string | null;
}

export interface ProductWithCount extends Product {
  category: Category;
  brand: Brand | null;
  unit: Unit;
  images: ProductImage[];
  _count?: {
    images: number;
    batches: number;
  };
}

export interface ProductListItem extends ProductWithRelations {
  primaryImage?: string | null;
  batchCount: number;
}

export interface ProductWithFullRelations extends Product {
  images: ProductImage[];
  category: Category;
  brand: Brand | null;
  unit: Unit;
  batches: (ProductBatch & {
    stockIns?: StockIn[];
    stockOuts?: StockOut[];
  })[];
  discounts: Discount[];
}

export interface ProductBatchWithRelations extends ProductBatch {
  product: Product;
  stockIns: StockIn[];
  stockOuts: StockOut[];
  unit: Unit;
}

export interface ProductImageWithUrl extends ProductImage {
  fullUrl: string;
}

export interface MinimalProduct {
  id: string;
  name: string;
  isActive: boolean;
}

export interface ProductSimple {
  id: string;
  name: string;
  price: number;
  currentStock: number;
  categoryName: string;
  brandName: string | null;
  unitSymbol: string;
  primaryImage: string | null;
}

// Stock history types
export type StockHistoryItem =
  | (StockIn & {
      type: 'in';
      batch: ProductBatch & { product: Product };
      supplier?: Supplier | null;
      unit: Unit;
    })
  | (StockOut & {
      type: 'out';
      batch: ProductBatch & { product: Product };
      unit: Unit;
    });

// Search and pagination types
export interface ProductSearchParams {
  query?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductPaginationParams {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductFilterOptions {
  search?: string;
  exactId?: string;
  take?: number;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
}

// Response types
export interface PaginatedProductResponse {
  products: ProductListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface ProductSearchResult {
  products: ProductListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Form data types
export interface ProductFormData {
  name: string;
  categoryId: string;
  brandId?: string | null;
  description?: string | null;
  unitId: string;
  cost?: number;
  price: number;
  skuCode?: string | null;
  barcode?: string | null;
  isActive: boolean;
}

export interface ProductBatchFormData {
  batchCode: string;
  expiryDate: Date;
  quantity: number;
  buyPrice: number;
}

export interface TempProductImage {
  id: string;
  imageUrl: string;
  fullUrl: string;
  isPrimary: boolean;
}

// Creation and update types
export type CreateProductData = {
  name: string;
  categoryId: string;
  brandId?: string | null;
  description?: string | null;
  unitId: string;
  cost?: number;
  price: number;
  skuCode?: string | null;
  barcode?: string | null;
  isActive?: boolean;
};

export type UpdateProductData = {
  name?: string;
  categoryId?: string;
  brandId?: string | null;
  description?: string | null;
  unitId?: string;
  cost?: number;
  price?: number;
  skuCode?: string | null;
  barcode?: string | null;
  isActive?: boolean;
};

export type CreateProductImageData = {
  productId: string;
  imageUrl: string;
  isPrimary: boolean;
};

export type UpdateProductImageData = {
  isPrimary?: boolean;
};

// Where input types for filtering
export interface ProductWhereInput {
  id?: string | { contains: string; mode?: 'insensitive' };
  name?: string | { contains: string; mode?: 'insensitive' };
  description?: string | { contains: string; mode?: 'insensitive' };
  skuCode?: string | { contains: string; mode?: 'insensitive' };
  barcode?: string | { contains: string; mode?: 'insensitive' };
  categoryId?: string;
  brandId?: string | null;
  unitId?: string;
  isActive?: boolean;
  price?: {
    gte?: number;
    lte?: number;
  };
  OR?: Array<{
    name?: { contains: string; mode?: 'insensitive' };
    description?: { contains: string; mode?: 'insensitive' };
    skuCode?: { contains: string; mode?: 'insensitive' };
    barcode?: { contains: string; mode?: 'insensitive' };
    id?: { contains: string; mode?: 'insensitive' };
  }>;
}

// Order by input types
export interface ProductOrderByInput {
  [key: string]: 'asc' | 'desc' | { name?: 'asc' | 'desc' };
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

// Specific API response types
export type GetProductsResponse = ApiResponse<PaginatedProductResponse>;
export type GetProductResponse = ApiResponse<ProductWithRelations>;
export type CreateProductResponse = ApiResponse<ProductWithRelations>;
export type UpdateProductResponse = ApiResponse<ProductWithRelations>;
export type DeleteProductResponse = ApiResponse<void>;
export type GetProductImagesResponse = ApiResponse<ProductImageWithUrl[]>;
export type CreateProductImageResponse = ApiResponse<ProductImage>;
export type UpdateProductImageResponse = ApiResponse<ProductImage>;
export type DeleteProductImageResponse = ApiResponse<void>;

// Table fetch options for compatibility with useFetch hook
export interface ProductFetchOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: { id: string; desc: boolean };
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  pagination?: unknown;
  [key: string]: unknown;
}

// Table fetch result
export interface ProductFetchResult<T = unknown> {
  data: T;
  totalRows: number;
  [key: string]: unknown;
}

// Loading states for UI components
export interface ProductLoadingState {
  products: boolean;
  images: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

// Form states for dialogs
export interface ProductFormState {
  name: string;
  categoryId: string;
  brandId: string;
  description: string;
  unitId: string;
  cost: number;
  price: number;
  skuCode: string;
  barcode: string;
  isActive: boolean;
}

// Service method parameters
export interface GetProductsWithOptionsParams {
  where?: ProductWhereInput;
  orderBy?: ProductOrderByInput;
  skip?: number;
  take?: number;
  include?: {
    category?: boolean;
    brand?: boolean;
    unit?: boolean;
    images?: boolean | { where?: { isPrimary?: boolean }; take?: number };
    batches?: boolean;
    discounts?: boolean;
    _count?: {
      select?: {
        images?: boolean;
        batches?: boolean;
      };
    };
  };
}

// Enhanced filtered product type for POS/transactions
export interface ProductForTransaction extends Product {
  category: Category;
  brand: Brand | null;
  unit: Unit;
  batches: ProductBatch[];
  discounts: Discount[];
  availableBatch?: ProductBatch | null;
  discountedPrice?: number;
}
