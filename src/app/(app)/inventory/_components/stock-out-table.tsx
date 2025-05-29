'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  StockOutComplete,
  TableFetchOptions,
  TableFetchResult,
} from '@/lib/types/inventory';
import { format } from 'date-fns';
import { TableLayout } from '@/components/layout/table-layout';
import { useFetch } from '@/hooks/use-fetch';
import { getAllStockOuts } from '../stock-actions';
import { memo, useEffect, useMemo, useCallback, useRef } from 'react';

interface StockOutTableProps {
  isActive?: boolean;
}

export const StockOutTable = memo(function StockOutTable({
  isActive = false,
}: StockOutTableProps) {
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoized columns to prevent unnecessary re-renders
  const columns = useMemo(
    (): ColumnDef<StockOutComplete>[] => [
      {
        accessorKey: 'batch.product.name',
        header: 'Product',
        cell: ({ row }) => {
          const stockOut = row.original;
          return (
            <div className="font-medium">{stockOut.batch.product.name}</div>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: 'batch.batchCode',
        header: 'Batch Code',
        cell: ({ row }) => {
          const stockOut = row.original;
          return <div>{stockOut.batch.batchCode}</div>;
        },
        enableSorting: true,
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity Out',
        cell: ({ row }) => {
          const stockOut = row.original;
          return (
            <div className="text-red-600 font-medium">
              -{stockOut.quantity.toLocaleString()} {stockOut.unit.symbol}
            </div>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => {
          return <div>{row.getValue('reason')}</div>;
        },
        enableSorting: false,
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => {
          const date = new Date(row.getValue('date'));
          return (
            <div className="text-sm">{format(date, 'dd MMM yyyy HH:mm')}</div>
          );
        },
        enableSorting: true,
      },
    ],
    [],
  );

  // Stabilize fetchStockOutData with abort controller
  const fetchStockOutData = useCallback(
    async (
      options: TableFetchOptions,
    ): Promise<TableFetchResult<StockOutComplete[]>> => {
      try {
        if (!isActive) {
          return { data: [], totalRows: 0 };
        }

        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        const response = await getAllStockOuts({
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
          console.error('Failed to fetch stock-out data:', response.error);
          return { data: [], totalRows: 0 };
        }

        return {
          data: response.data || [],
          totalRows: response.meta?.rowsCount || 0,
        };
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching stock-out data:', error);
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
    fetchData: fetchStockOutData,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'date',
    initialSortDirection: true, // Newest first
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
