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
import { memo, useCallback, useEffect } from 'react';

interface StockInTableProps {
  isActive?: boolean;
}

export const StockInTable = memo(function StockInTable({
  isActive = false,
}: StockInTableProps) {
  // Format date function
  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'PPP');
  };

  // Define columns
  const columns: ColumnDef<StockInComplete>[] = [
    {
      accessorKey: 'date',
      header: 'date',
      cell: ({ row }) => formatDate(row.original.date),
    },

    // Product column
    {
      accessorKey: 'batch.product.name',
      header: 'product name',
      cell: ({ row }) => {
        return (
          <div className="font-medium">{row.original.batch.product.name}</div>
        );
      },
    },

    // Batch Code column
    {
      accessorKey: 'batch.batchCode',
      header: 'batch code',
      cell: ({ row }) => <div>{row.original.batch.batchCode}</div>,
    },

    // Quantity column
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

    // Supplier column
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
  ];

  // Memoize the fetch function to prevent it from changing on every render
  const fetchDataTable = useCallback(
    async (
      options: TableFetchOptions,
    ): Promise<TableFetchResult<StockInComplete[]>> => {
      try {
        if (!isActive) {
          return { data: [], totalRows: 0 };
        }

        const response = await getAllStockIns({
          page: (options.page || 0) + 1,
          limit: options.limit || 10,
          sortBy: options.sortBy?.id || 'date',
          sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
          search: options.search,
          columnFilter: ['batch.product.name', 'batch.batchCode'],
        });

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
        console.error('Error fetching stock-in data:', error);
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
  }, [isActive, refresh]);

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setPage(newPagination.pageIndex);
    setLimit(newPagination.pageSize);
  };

  const handleSortingChange = (newSorting: { id: string; desc: boolean }[]) => {
    setSortBy(newSorting);
  };

  const handleSearchChange = (search: string) => {
    setSearch(search);
  };

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
