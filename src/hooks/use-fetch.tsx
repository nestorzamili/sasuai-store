'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { debounce } from '@/lib/common/debounce-effect';

export interface SortByOptions {
  id: string;
  desc: boolean;
}

export interface PaginationOptions {
  pageIndex: number;
  pageSize: number;
}

export interface TableFetchOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: SortByOptions;
  sortOrder?: string;
  columnFilter?: string[];
  filters?: Record<string, string | number | boolean | null | undefined>;
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | string[]
    | SortByOptions
    | Record<string, unknown>;
}

export interface FetchResult<T> {
  data: T;
  totalRows: number;
  [key: string]: unknown;
}

export interface FetchOptions<T> {
  fetchData: (options: TableFetchOptions) => Promise<FetchResult<T>>;
  options?: TableFetchOptions;
  initialPageIndex?: number;
  initialPageSize?: number;
  initialSortField?: string;
  initialSortDirection?: boolean;
  initialFilters?: Record<string, string | number | boolean | null | undefined>;
  debounceTime?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: FetchResult<T>) => void;
}

export interface HookOptions {
  pagination: PaginationOptions;
  sortBy: SortByOptions;
  search: string;
  sortOrder?: string;
  columnFilter?: string[];
  filters: Record<string, string | number | boolean | null | undefined>;
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | string[]
    | PaginationOptions
    | SortByOptions
    | Record<string, unknown>;
}

export function useFetch<T>(fetchOptions: FetchOptions<T>) {
  // Destructure stable parts of fetchOptions
  const {
    fetchData: fetchDataFn,
    onSuccess,
    onError,
    debounceTime = 500,
  } = fetchOptions;

  const [data, setData] = useState<T | undefined>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [options, setOptions] = useState<HookOptions>({
    pagination: {
      pageIndex:
        fetchOptions.initialPageIndex ?? fetchOptions.options?.page ?? 0,
      pageSize:
        fetchOptions.initialPageSize ?? fetchOptions.options?.limit ?? 10,
    },
    sortBy: {
      id:
        fetchOptions.initialSortField ??
        fetchOptions.options?.sortBy?.id ??
        'id',
      desc:
        fetchOptions.initialSortDirection ??
        fetchOptions.options?.sortBy?.desc ??
        false,
    },
    search: fetchOptions.options?.search || '',
    sortOrder: fetchOptions.options?.sortOrder,
    columnFilter: fetchOptions.options?.columnFilter || [],
    filters: fetchOptions.initialFilters || fetchOptions.options?.filters || {}, // Initialize filters state
    // Copy any additional options
    ...(fetchOptions.options
      ? Object.fromEntries(
          Object.entries(fetchOptions.options).filter(
            ([key]) =>
              ![
                'page',
                'limit',
                'search',
                'sortBy',
                'sortOrder',
                'columnFilter',
                'filters',
              ].includes(key),
          ),
        )
      : {}),
  });
  const [totalRows, setTotalRows] = useState<number>(0);

  // Reset pagination when search changes
  const resetPagination = useCallback(() => {
    setOptions((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, pageIndex: 0 },
    }));
  }, []);

  const setPage = useCallback(
    (newPage: number) =>
      setOptions((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, pageIndex: newPage },
      })),
    [],
  );

  const setLimit = useCallback((newLimit: number) => {
    setOptions((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, pageSize: newLimit },
    }));
  }, []);

  const setSearch = useMemo(
    () =>
      debounce((newSearch: string) => {
        setOptions((prev) => ({ ...prev, search: newSearch }));
        resetPagination();
      }, debounceTime),
    [resetPagination, debounceTime],
  );

  const setSortBy = useCallback((newSortBy: SortByOptions[]) => {
    if (!newSortBy?.length) return;

    // Create a local variable for the new sort values
    const newSort = {
      id: newSortBy[0]?.id || 'id',
      desc: newSortBy[0]?.desc || false,
    };

    // Update state with the new sort values
    setOptions((prev) => ({
      ...prev,
      sortBy: newSort,
    }));
  }, []);

  const setColumnFilter = useCallback(
    (newColumnFilter: string[]) => {
      setOptions((prev) => ({
        ...prev,
        columnFilter: newColumnFilter,
      }));
      resetPagination();
    },
    [resetPagination],
  );

  // Add a dedicated setFilters function
  const setFilters = useCallback(
    (
      newFilters:
        | Record<string, string | number | boolean | null | undefined>
        | ((
            prev: Record<string, string | number | boolean | null | undefined>,
          ) => Record<string, string | number | boolean | null | undefined>),
    ) => {
      setOptions((prev) => ({
        ...prev,
        filters:
          typeof newFilters === 'function'
            ? newFilters(prev.filters)
            : { ...prev.filters, ...newFilters },
      }));
      resetPagination();
    },
    [resetPagination],
  );

  // Add custom option setter
  const setCustomOption = useCallback(
    (key: string, value: string | number | boolean | null | undefined) => {
      setOptions((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const fetchData = useCallback(
    async (options: TableFetchOptions) => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchDataFn(options);
        setData(result.data);
        setTotalRows(result.totalRows);

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        setError(errorObj);
        console.error('Error fetching data:', errorObj);

        if (onError) {
          onError(errorObj);
        }

        return { data: undefined as T, totalRows: 0 };
      } finally {
        setLoading(false);
      }
    },
    [fetchDataFn, onSuccess, onError],
  ); // Include the destructured dependencies

  const formattedOptions = useMemo(
    () => ({
      page: options.pagination.pageIndex,
      limit: options.pagination.pageSize,
      search: options.search,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      columnFilter: options.columnFilter,
      filters: options.filters, // Include filters in formattedOptions
      // Include any additional custom options
      ...Object.fromEntries(
        Object.entries(options).filter(
          ([key]) =>
            ![
              'pagination',
              'sortBy',
              'search',
              'sortOrder',
              'columnFilter',
              'filters',
            ].includes(key),
        ),
      ),
    }),
    [options],
  );

  useEffect(() => {
    fetchData(formattedOptions);
  }, [formattedOptions, fetchData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData(formattedOptions);
  }, [fetchData, formattedOptions]);

  return {
    data,
    fetchData,
    isLoading,
    error,
    options,
    totalRows,
    setPage,
    setLimit,
    setSortBy,
    setSearch,
    setColumnFilter,
    setFilters, // Add setFilters to return value
    setCustomOption,
    refresh,
    resetPagination,
  };
}
