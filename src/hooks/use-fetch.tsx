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
  [key: string]: any; // Allow for additional custom options
}

export interface FetchOptions<T> {
  fetchData: (
    options: TableFetchOptions
  ) => Promise<{ data: T; totalRows: number; [key: string]: any }>;
  options?: TableFetchOptions;
  initialPageIndex?: number;
  initialPageSize?: number;
  initialSortField?: string;
  initialSortDirection?: boolean;
  debounceTime?: number;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
}

export interface HookOptions {
  pagination: PaginationOptions;
  sortBy: SortByOptions;
  search: string;
  sortOrder?: string;
  columnFilter?: string[];
  [key: string]: any; // Allow for additional custom options
}

export function useFetch<T>(fetchOptions: FetchOptions<T>) {
  const [data, setData] = useState<T | undefined>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
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
              ].includes(key)
          )
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
    []
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
      }, fetchOptions.debounceTime || 500),
    [resetPagination, fetchOptions.debounceTime]
  );

  const setSortBy = useCallback((newSortBy: SortByOptions[]) => {
    if (!newSortBy?.length) return;

    setOptions((prev) => ({
      ...prev,
      sortBy: {
        id: newSortBy[0]?.id || prev.sortBy.id,
        desc: newSortBy[0]?.desc || prev.sortBy.desc,
      },
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
    [resetPagination]
  );

  // Add custom option setter
  const setCustomOption = useCallback((key: string, value: any) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const fetchData = useCallback(async (options: TableFetchOptions) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchOptions.fetchData(options);
      setData(result.data);
      setTotalRows(result.totalRows);

      if (fetchOptions.onSuccess) {
        fetchOptions.onSuccess(result);
      }

      return result;
    } catch (error) {
      setError(error);
      console.error('Error fetching data:', error);

      if (fetchOptions.onError) {
        fetchOptions.onError(error);
      }

      return { data: undefined, totalRows: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const formattedOptions = useMemo(
    () => ({
      page: options.pagination.pageIndex,
      limit: options.pagination.pageSize,
      search: options.search,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      columnFilter: options.columnFilter,
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
            ].includes(key)
        )
      ),
    }),
    [options]
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
    setCustomOption,
    refresh,
    resetPagination,
  };
}
