'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { StockInComplete } from '@/lib/types/stock-movement';
import { format } from 'date-fns';
import { TableLayout } from '@/components/layout/table-layout';
import { useFetch } from '@/hooks/use-fetch';
import { getAllStockIns } from '../stock-actions';
import { memo, useRef, useCallback, useEffect } from 'react';

interface StockInTableProps {
  isActive?: boolean;
}

export const StockInTable = memo(function StockInTable({
  isActive = false,
}: StockInTableProps) {
  // Track if this is the initial render
  const isInitialMount = useRef(true);

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
  const fetchDataTable = useCallback(async (options: any) => {
    try {
      const response = await getAllStockIns({
        page: options.page + 1,
        limit: options.limit,
        sortBy: options.sortBy?.id || 'date',
        sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
        search: options.search,
        columnFilter: ['batch.product.name', 'batch.batchCode'],
      });

      // Better error logging
      if (!response.success) {
        console.error('Failed to fetch stock-in data:', response.error);
        return { data: [], totalRows: 0 };
      }

      // Validate the response data
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
  }, []);

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
    initialSortField: 'date', // Changed from 'id' to 'date'
    initialSortDirection: true, // Changed to true for newest first
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

  const handleSortingChange = (newSorting: any) => {
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
