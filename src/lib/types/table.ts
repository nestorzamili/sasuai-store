/**
 * Common table sorting option
 */
export interface SortOption {
  id: string;
  desc: boolean;
}

/**
 * Array of sort options for table components
 */
export type SortByOptions = SortOption[];

/**
 * Common table fetch options used by useFetch hook
 */
export interface TableFetchOptions {
  page?: number;
  limit?: number;
  sortBy?: SortByOptions | SortOption;
  search?: string;
}

/**
 * Convert any sort option to consistent format expected by server
 */
export function normalizeSortOption(
  sortBy?: SortByOptions | SortOption,
): SortOption | undefined {
  if (!sortBy) {
    return undefined;
  }

  if (Array.isArray(sortBy) && sortBy.length > 0) {
    return sortBy[0];
  }

  if (typeof sortBy === 'object' && 'id' in sortBy) {
    return sortBy;
  }

  return undefined;
}

/**
 * Common table data structure
 */
export interface TableData<T> {
  data: T[];
  total: number;
}
