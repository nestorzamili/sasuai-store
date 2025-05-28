// Base brand interface
export interface Brand {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Brand with product count
export interface BrandWithCount extends Brand {
  _count?: {
    products: number;
  };
}

// Brand creation data - make description optional and nullable
export type CreateBrandData = {
  name: string;
};

// Brand update data - ensure proper nullable handling
export type UpdateBrandData = {
  name?: string;
};

// Brand search parameters
export type BrandSearchParams = {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  columnFilter?: string[];
};

// Where input for filtering
export interface BrandWhereInput {
  id?: string;
  name?: string | { contains: string; mode?: 'insensitive' };
  OR?: Array<{
    name?: { contains: string; mode?: 'insensitive' };
  }>;
}

// Order by input for sorting
export interface BrandOrderByInput {
  [key: string]: 'asc' | 'desc';
}

// Paginated response for brands
export type PaginatedBrandResponse = {
  brands: BrandWithCount[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

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
export type GetBrandsResponse = ApiResponse<PaginatedBrandResponse>;
export type GetBrandResponse = ApiResponse<Brand>;
export type CreateBrandResponse = ApiResponse<Brand>;
export type UpdateBrandResponse = ApiResponse<Brand>;
export type DeleteBrandResponse = ApiResponse<void>;

// Service method parameters
export interface GetBrandsWithCountParams {
  where?: BrandWhereInput;
  orderBy?: BrandOrderByInput;
  skip?: number;
  take?: number;
}

// Table fetch options for compatibility with useFetch hook
export interface BrandFetchOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: { id: string; desc: boolean };
  columnFilter?: string[];
  pagination?: unknown;
  [key: string]: unknown;
}

// Table fetch result
export interface BrandFetchResult<T = unknown> {
  data: T;
  totalRows: number;
  [key: string]: unknown;
}

// Loading states for UI components
export interface BrandLoadingState {
  brands: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

// Form state for brand dialog
export interface BrandFormState {
  name: string;
}
