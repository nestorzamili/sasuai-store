'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import {
  StockInComplete,
  TableFetchOptions,
  TableFetchResult,
} from '@/lib/types/inventory';
import { format } from 'date-fns';
import { TableLayout } from '@/components/layout/table-layout';
import { useFetch } from '@/hooks/use-fetch';
import { getAllStockIns } from '../stock-actions';
import { memo, useEffect, useCallback, useMemo, useRef } from 'react';

interface StockInTableProps {
  isActive?: boolean;
}

export const StockInTable = memo(function StockInTable({
  isActive = false,
}: StockInTableProps) {
  const abortControllerRef = useRef<AbortController | null>(null);

  // Format date function - memoized
  const formatDate = useCallback((date: Date | string) => {
    return format(new Date(date), 'PPP');
  }, []);

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(
    (): ColumnDef<StockInComplete>[] => [
      {
        accessorKey: 'date',
        header: 'date',
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        accessorKey: 'batch.product.name',
        header: 'product name',
        cell: ({ row }) => {
          return (
            <div className="font-medium">{row.original.batch.product.name}</div>
          );
        },
      },
      {
        accessorKey: 'batch.batchCode',
        header: 'batch code',
        cell: ({ row }) => <div>{row.original.batch.batchCode}</div>,
      },
      {
        accessorKey: 'quantity',
        header: 'quantity',
        cell: ({ row }) => {
          const quantity = row.getValue('quantity') as number;
          const unit = row.original.unit?.symbol || '';
          return (
            <div className="text-left">
              {quantity} {unit}
            </div>
          );
        },
      },
      {
        accessorKey: 'supplier.name',
        header: 'supplier',
        cell: ({ row }) => {
          const supplier = row.original.supplier;
          return supplier ? (
            <div>{supplier.name}</div>
          ) : (
            <Badge variant="outline">No Supplier</Badge>
          );
        },
      },
    ],
    [formatDate],
  );

  // Stabilize fetchDataTable with abort controller
  const fetchDataTable = useCallback(
    async (
      options: TableFetchOptions,
    ): Promise<TableFetchResult<StockInComplete[]>> => {
      try {
        if (!isActive) {
          return { data: [], totalRows: 0 };
        }

        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        const response = await getAllStockIns({
          page: (options.page || 0) + 1,
          limit: options.limit || 10,
          sortBy: options.sortBy?.id || 'date',
          sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
          search: options.search,
          columnFilter: ['batch.product.name', 'batch.batchCode'],
        });

        if (abortControllerRef.current?.signal.aborted) {
          return { data: [], totalRows: 0 };
        }

        if (!response.success) {
          console.error('Failed to fetch stock-in data:', response.error);
          return { data: [], totalRows: 0 };
        }

        if (!response.data || !Array.isArray(response.data)) {
          console.error('Invalid data structure received:', response);
          return { data: [], totalRows: 0 };
        }

        return {
          data: response.data,
          totalRows: response.meta?.rowsCount || 0,
        };
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching stock-in data:', error);
        }
        return { data: [], totalRows: 0 };
      }
    },
    [isActive],
  );

  const {
    data,
    isLoading,
    options,
    setPage,
    setLimit,
    setSortBy,
    setSearch,
    totalRows,
    refresh,
  } = useFetch({
    fetchData: fetchDataTable,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'date',
    initialSortDirection: true,
  });

  // Refresh data when tab becomes active
  useEffect(() => {
    if (isActive) {
      refresh();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isActive, refresh]);

  // Memoize handlers to prevent unnecessary re-renders
  const handlePaginationChange = useCallback(
    (newPagination: { pageIndex: number; pageSize: number }) => {
      setPage(newPagination.pageIndex);
      setLimit(newPagination.pageSize);
    },
    [setPage, setLimit],
  );

  const handleSortingChange = useCallback(
    (newSorting: { id: string; desc: boolean }[]) => {
      setSortBy(newSorting);
    },
    [setSortBy],
  );

  const handleSearchChange = useCallback(
    (search: string) => {
      setSearch(search);
    },
    [setSearch],
  );

  return (
    <div className="space-y-4">
      <TableLayout
        data={data || []}
        columns={columns}
        isLoading={isLoading}
        pagination={options.pagination}
        handlePaginationChange={handlePaginationChange}
        handleSortingChange={handleSortingChange}
        handleSearchChange={handleSearchChange}
        totalRows={totalRows}
        enableSelection={true}
      />
    </div>
  );
});
