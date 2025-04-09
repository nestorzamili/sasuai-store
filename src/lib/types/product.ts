import {
  Brand,
  Category,
  Product,
  ProductBatch,
  ProductImage,
  StockIn,
  StockOut,
  Unit,
} from '@prisma/client';

// Basic types with relationships
export type ProductWithRelations = Product & {
  category: Category;
  brand: Brand | null;
  unit: Unit;
  images: ProductImage[];
  batches?: ProductBatch[];
};

export type ProductWithCount = Product & {
  category: Category;
  brand: Brand | null;
  unit: Unit;
  images: ProductImage[];
  _count?: {
    images: number;
    batches: number;
  };
};

export type ProductSimple = {
  id: string;
  name: string;
  price: number;
  currentStock: number;
  categoryName: string;
  brandName: string | null;
  unitSymbol: string;
  primaryImage: string | null;
};

export type ProductWithFullRelations = Product & {
  images?: ProductImage[];
  category: Category;
  brand?: Brand | null;
  unit: Unit;
  batches: (ProductBatch & {
    stockIns?: StockIn[];
    stockOuts?: StockOut[];
  })[];
};

export type ProductBatchWithRelations = ProductBatch & {
  product: Product;
};

// Type with image URLs for frontend display
export type ProductImageWithUrl = ProductImage & {
  fullUrl: string;
};

export type MinimalProduct = {
  id: string;
  name: string;
  isActive: boolean;
};

// Type for product list view with primary image
export type ProductListItem = ProductWithRelations & {
  primaryImage?: string;
  batchCount: number;
  price: number;
};

// Type for stock history
export type StockHistoryItem =
  | (StockIn & {
      type: 'in';
      batch: ProductBatch & { product: Product };
      supplier?: { name: string } | null;
      unit: Unit;
    })
  | (StockOut & {
      type: 'out';
      batch: ProductBatch & { product: Product };
      unit: Unit;
    });

// Search params for product search
export type ProductSearchParams = {
  query?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
};

// Pagination params for server-side pagination
export type ProductPaginationParams = {
  page: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
};

// Server response for paginated products
export type PaginatedProductResponse = {
  products: ProductListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

// Response type for product search results
export type ProductSearchResult = {
  products: ProductListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

// Form data types
export type ProductFormData = {
  name: string;
  categoryId: string;
  brandId?: string | null;
  description?: string | null;
  unitId: string;
  price: number;
  skuCode?: string | null;
  barcode?: string | null;
  isActive: boolean;
};

export type ProductBatchFormData = {
  batchCode: string;
  expiryDate: Date;
  quantity: number;
  buyPrice: number;
};

// Updated type for temporary images during product creation to match ProductImageWithUrl structure
export type TempProductImage = {
  id: string;
  imageUrl: string;
  fullUrl: string; // Add this to maintain consistency with ProductImageWithUrl
  isPrimary: boolean;
};
