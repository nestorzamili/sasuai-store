// Base unit interface
export interface Unit {
  id: string;
  name: string;
  symbol: string;
  createdAt: Date;
  updatedAt: Date;
}

// Unit conversion interface
export interface UnitConversion {
  id: string;
  fromUnitId: string;
  toUnitId: string;
  conversionFactor: number;
  createdAt: Date;
  updatedAt: Date;
}

// Unit with counts of related records
export interface UnitWithCounts extends Unit {
  _count: {
    products: number;
    stockIns: number;
    stockOuts: number;
    transactionItems: number;
    fromUnitConversions: number;
    toUnitConversions: number;
  };
}

// Unit conversion with related units
export interface UnitConversionWithUnits extends UnitConversion {
  fromUnit: Unit;
  toUnit: Unit;
}

// Unit creation data
export type CreateUnitData = {
  name: string;
  symbol: string;
};

// Unit update data
export type UpdateUnitData = {
  name?: string;
  symbol?: string;
};

// Unit conversion creation data
export type CreateUnitConversionData = {
  fromUnitId: string;
  toUnitId: string;
  conversionFactor: number;
};

// Unit conversion update data
export type UpdateUnitConversionData = {
  conversionFactor: number;
};

// Unit search parameters
export type UnitSearchParams = {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  columnFilter?: string[];
};

// Unit conversion search parameters
export type UnitConversionSearchParams = {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

// Where input for filtering units
export interface UnitWhereInput {
  id?: string;
  name?: string | { contains: string; mode?: 'insensitive' };
  symbol?: string | { contains: string; mode?: 'insensitive' };
  OR?: Array<{
    name?: { contains: string; mode?: 'insensitive' };
    symbol?: { contains: string; mode?: 'insensitive' };
  }>;
}

// Where input for filtering unit conversions
export interface UnitConversionWhereInput {
  id?: string;
  fromUnitId?: string;
  toUnitId?: string;
  OR?: Array<{
    fromUnit?: {
      name?: { contains: string; mode?: 'insensitive' };
      symbol?: { contains: string; mode?: 'insensitive' };
    };
    toUnit?: {
      name?: { contains: string; mode?: 'insensitive' };
      symbol?: { contains: string; mode?: 'insensitive' };
    };
  }>;
}

// Order by input for sorting
export interface UnitOrderByInput {
  [key: string]: 'asc' | 'desc';
}

// Order by input for unit conversions
export interface UnitConversionOrderByInput {
  [key: string]: 'asc' | 'desc' | { name: 'asc' | 'desc' };
}

// Paginated response for units
export type PaginatedUnitResponse = {
  units: UnitWithCounts[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};

// Paginated response for unit conversions
export type PaginatedUnitConversionResponse = {
  conversions: UnitConversionWithUnits[];
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
export type GetUnitsResponse = ApiResponse<PaginatedUnitResponse>;
export type GetUnitResponse = ApiResponse<Unit>;
export type CreateUnitResponse = ApiResponse<Unit>;
export type UpdateUnitResponse = ApiResponse<Unit>;
export type DeleteUnitResponse = ApiResponse<void>;
export type GetConversionsResponse =
  ApiResponse<PaginatedUnitConversionResponse>;
export type CreateConversionResponse = ApiResponse<UnitConversionWithUnits>;
export type UpdateConversionResponse = ApiResponse<UnitConversionWithUnits>;
export type DeleteConversionResponse = ApiResponse<void>;
export type ConvertQuantityResponse = ApiResponse<number>;

// Service method parameters
export interface GetUnitsWithCountsParams {
  where?: UnitWhereInput;
  orderBy?: UnitOrderByInput;
  skip?: number;
  take?: number;
}

export interface GetConversionsParams {
  where?: UnitConversionWhereInput;
  orderBy?: UnitConversionOrderByInput;
  skip?: number;
  take?: number;
}

// Table fetch options for compatibility with useFetch hook
export interface UnitFetchOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: { id: string; desc: boolean };
  columnFilter?: string[];
  pagination?: unknown;
  [key: string]: unknown;
}

export interface UnitConversionFetchOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: { id: string; desc: boolean };
  pagination?: unknown;
  [key: string]: unknown;
}

// Table fetch result
export interface UnitFetchResult<T = unknown> {
  data: T;
  totalRows: number;
  [key: string]: unknown;
}

// Loading states for UI components
export interface UnitLoadingState {
  units: boolean;
  conversions: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

// Form state for unit dialog
export interface UnitFormState {
  name: string;
  symbol: string;
}

// Form state for unit conversion dialog
export interface UnitConversionFormState {
  fromUnitId: string;
  toUnitId: string;
  conversionFactor: number;
}

// Unit conversion with additional data
export interface ConversionForUnit {
  fromConversions: UnitConversionWithUnits[];
  toConversions: UnitConversionWithUnits[];
}
