'use client';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  // Use ref to store latest fetchData to avoid recreating fetchData callback
  const fetchDataRef = useRef(fetchOptions.fetchData);
  const onSuccessRef = useRef(fetchOptions.onSuccess);
  const onErrorRef = useRef(fetchOptions.onError);

  // Update refs when props change
  useEffect(() => {
    fetchDataRef.current = fetchOptions.fetchData;
    onSuccessRef.current = fetchOptions.onSuccess;
    onErrorRef.current = fetchOptions.onError;
  });

  const debounceTime = fetchOptions.debounceTime ?? 500;

  const [data, setData] = useState<T | undefined>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Stable initial options using useMemo with proper JSON stringification for deep comparison
  const initialOptions = useMemo(
    () => ({
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
      filters:
        fetchOptions.initialFilters || fetchOptions.options?.filters || {},
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
    }),
    [
      fetchOptions.initialPageIndex,
      fetchOptions.initialPageSize,
      fetchOptions.initialSortField,
      fetchOptions.initialSortDirection,
      // Use JSON.stringify for deep comparison of complex objects
      JSON.stringify(fetchOptions.initialFilters),
      JSON.stringify(fetchOptions.options),
    ],
  );

  const [options, setOptions] = useState<HookOptions>(initialOptions);
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

  // Stable debounced search function
  const debouncedSetSearch = useMemo(
    () =>
      debounce((newSearch: string) => {
        setOptions((prev) => ({
          ...prev,
          search: newSearch,
          // Reset pagination when search changes in single update
          pagination: { ...prev.pagination, pageIndex: 0 },
        }));
      }, debounceTime),
    [debounceTime],
  );

  const setSearch = useCallback(
    (newSearch: string) => {
      debouncedSetSearch(newSearch);
    },
    [debouncedSetSearch],
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

  const setColumnFilter = useCallback((newColumnFilter: string[]) => {
    setOptions((prev) => ({
      ...prev,
      columnFilter: newColumnFilter,
      // Reset pagination when column filter changes
      pagination: { ...prev.pagination, pageIndex: 0 },
    }));
  }, []);

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
        // Reset pagination when filters change
        pagination: { ...prev.pagination, pageIndex: 0 },
      }));
    },
    [],
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

  // Stable fetchData function with request deduplication
  const fetchData = useCallback(
    async (options: TableFetchOptions) => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchDataRef.current(options);
        setData(result.data);
        setTotalRows(result.totalRows);

        if (onSuccessRef.current) {
          onSuccessRef.current(result);
        }

        return result;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        setError(errorObj);
        console.error('Error fetching data:', errorObj);

        if (onErrorRef.current) {
          onErrorRef.current(errorObj);
        }

        return { data: undefined as T, totalRows: 0 };
      } finally {
        setLoading(false);
      }
    },
    [], // Empty dependency array since we use refs
  );

  // Create a stable string representation of options for comparison
  const optionsKey = useMemo(() => {
    const stableOptions = {
      page: options.pagination.pageIndex,
      limit: options.pagination.pageSize,
      search: options.search,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      columnFilter: options.columnFilter,
      filters: options.filters,
      // Add custom options
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
    };

    return JSON.stringify(stableOptions);
  }, [options]);

  // Use a ref to track the last executed options to prevent duplicate requests
  const lastExecutedOptionsRef = useRef<string>('');
  const requestTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Effect with proper dependency management and request deduplication
  useEffect(() => {
    // Skip if options haven't actually changed
    if (lastExecutedOptionsRef.current === optionsKey) {
      return;
    }

    // Clear any pending request
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }

    let isCancelled = false;

    const runFetch = async () => {
      // Small delay to batch rapid changes
      requestTimeoutRef.current = setTimeout(async () => {
        if (!isCancelled && lastExecutedOptionsRef.current !== optionsKey) {
          lastExecutedOptionsRef.current = optionsKey;

          const parsedOptions = JSON.parse(optionsKey);
          await fetchData(parsedOptions);
        }
      }, 10);
    };

    runFetch();

    return () => {
      isCancelled = true;
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }
    };
  }, [optionsKey, fetchData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    const parsedOptions = JSON.parse(optionsKey);
    fetchData(parsedOptions);
  }, [fetchData, optionsKey]);

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
    setFilters,
    setCustomOption,
    refresh,
    resetPagination,
  };
}
