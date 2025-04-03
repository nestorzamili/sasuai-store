import {
  Product,
  ProductImage,
  ProductVariant,
  ProductBatch,
  Barcode,
  Unit,
  Category,
  Brand,
  StockIn,
  StockOut,
} from '@prisma/client';

// Basic types with relationships
export type ProductWithRelations = Product & {
  images?: ProductImage[];
  category?: { name: string; id: string };
  brand?: { name: string; id: string; logoUrl: string | null } | null;
  variants?: ProductVariant[];
  _count?: { variants: number };
};

export type ProductWithFullRelations = Product & {
  images?: ProductImage[];
  category: Category;
  brand?: Brand | null;
  variants: (ProductVariant & {
    unit: Unit;
    batches: (ProductBatch & {
      barcodes?: Barcode[];
    })[];
  })[];
};

export type ProductVariantWithRelations = ProductVariant & {
  unit: Unit;
  product: Product;
  batches?: ProductBatch[];
};

export type ProductBatchWithRelations = ProductBatch & {
  variant: ProductVariant;
  barcodes?: Barcode[];
};

// Type with image URLs for frontend display
export type ProductImageWithUrl = ProductImage & {
  fullUrl: string;
};

// Type for product list view with primary image
export type ProductListItem = ProductWithRelations & {
  primaryImage?: string;
  variantCount: number;
  lowestPrice?: number;
  highestPrice?: number;
};

// Type for stock history
export type StockHistoryItem =
  | (StockIn & {
      type: 'in';
      batch: ProductBatch;
      supplier?: { name: string } | null;
      unit: Unit;
    })
  | (StockOut & { type: 'out'; batch: ProductBatch; unit: Unit });

// Search params for product search
export type ProductSearchParams = {
  query?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
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
  isActive: boolean;
  variants: ProductVariantFormData[];
};

export type ProductVariantFormData = {
  id?: string;
  name: string;
  unitId: string;
  price: number;
  skuCode?: string | null;
};

export type ProductBatchFormData = {
  batchCode: string;
  expiryDate: Date;
  quantity: number;
  buyPrice: number;
  barcodes?: string[];
};
