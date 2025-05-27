// Base category interface
export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Category with product count
export interface CategoryWithCount extends Category {
  _count?: {
    products: number;
  };
}

// Category creation data
export type CreateCategoryData = {
  name: string;
  description?: string;
};

// Category update data
export type UpdateCategoryData = {
  name?: string;
  description?: string | null;
};

// Category search parameters
export type CategorySearchParams = {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  columnFilter?: string[];
};

// Where input for filtering
export interface CategoryWhereInput {
  id?: string;
  name?: string | { contains: string; mode?: 'insensitive' };
  description?: string | { contains: string; mode?: 'insensitive' };
  OR?: Array<{
    name?: { contains: string; mode?: 'insensitive' };
    description?: { contains: string; mode?: 'insensitive' };
  }>;
}

// Order by input for sorting
export interface CategoryOrderByInput {
  [key: string]: 'asc' | 'desc';
}

// Paginated response for categories
export type PaginatedCategoryResponse = {
  categories: CategoryWithCount[];
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
export type GetCategoriesResponse = ApiResponse<PaginatedCategoryResponse>;
export type GetCategoryResponse = ApiResponse<Category>;
export type CreateCategoryResponse = ApiResponse<Category>;
export type UpdateCategoryResponse = ApiResponse<Category>;
export type DeleteCategoryResponse = ApiResponse<void>;

// Service method parameters
export interface GetCategoriesWithCountParams {
  where?: CategoryWhereInput;
  orderBy?: CategoryOrderByInput;
  skip?: number;
  take?: number;
}

// Table fetch options for compatibility with useFetch hook
export interface CategoryFetchOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: { id: string; desc: boolean };
  columnFilter?: string[];
  pagination?: unknown;
  [key: string]: unknown;
}

// Table fetch result
export interface CategoryFetchResult<T = unknown> {
  data: T;
  totalRows: number;
  [key: string]: unknown;
}

// Loading states for UI components
export interface CategoryLoadingState {
  categories: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

// Form state for category dialog
export interface CategoryFormState {
  name: string;
  description: string;
}
