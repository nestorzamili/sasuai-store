'use client';
import { useEffect, useState, useCallback } from 'react';
import { options } from '@/lib/types/table';
interface FetchOptions<T> {
  fetchData: (options: options) => Promise<{ data: T; totalRows: number }>;
  options?: options;
}
export function useFetch<T>(fetchOptions: FetchOptions<T>) {
  const [data, setData] = useState<T | undefined>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState({
    pagination: {
      pageIndex: fetchOptions.options?.page || 0,
      pageSize: fetchOptions.options?.limit || 10,
    },
    sortBy: {
      id: 'id',
      desc: false,
    },
    search: fetchOptions.options?.search,
    sortOrder: fetchOptions.options?.sortOrder,
  });
  const [totalRows, setTotalRows] = useState<number>(1);

  const setPage = (newPage: number) =>
    setOptions((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, pageIndex: newPage },
    }));

  const setLimit = (newLimit: number) => {
    setOptions((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, pageSize: newLimit },
    }));
  };

  const setSearch = (newSearch: string | undefined) =>
    setOptions((prev) => ({ ...prev, search: newSearch }));

  const setSortBy = (newSortBy: any) => {
    setOptions((prev) => ({
      ...prev,
      sortBy: {
        id: newSortBy?.[0]?.id || prev.sortBy.id,
        desc: newSortBy?.[0]?.desc || prev.sortBy.desc,
      },
    }));
  };

  const setSortOrder = (newSortOrder: string | undefined) =>
    setOptions((prev) => ({
      ...prev,
      sortBy: {
        ...prev.sortBy,
        desc: newSortOrder === 'desc',
      },
      sortOrder: newSortOrder,
    }));

  const fetchData = useCallback(
    async (options: options) => {
      try {
        setLoading(true);
        const result = await fetchOptions.fetchData(options);
        setData(result.data);
        console.log(result);
        setTotalRows(result.totalRows);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [fetchOptions]
  );

  useEffect(() => {
    const formattedOptions: options = {
      page: options.pagination.pageIndex,
      limit: options.pagination.pageSize,
      search: options.search,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
    };
    fetchData(formattedOptions);
  }, [
    options.pagination.pageIndex,
    options.pagination.pageSize,
    options.search,
    options.sortBy,
  ]);

  return {
    data,
    fetchData,
    isLoading,
    options,
    totalRows,
    setPage,
    setLimit,
    setSortBy,
  };
}
