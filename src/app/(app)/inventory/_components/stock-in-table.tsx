'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { StockInComplete } from '@/lib/types/stock-movement';
import { format } from 'date-fns';
import { TableLayout } from '@/components/layout/table-layout';
import { useFetch } from '@/hooks/use-fetch';
import { getAllOptimalizedStockIns } from '../stock-actions';
import { memo, useRef, useCallback } from 'react';

export const StockInTable = memo(function StockInTable() {
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
          <div className="text-center">
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
      // Skip initial fetch if not the first render (prevents double fetching)
      if (!isInitialMount.current) {
        console.log('Fetching stock in data');
      }
      isInitialMount.current = false;

      const response = await getAllOptimalizedStockIns({
        page: options.page + 1,
        limit: options.limit,
        sortBy: options.sortBy,
        search: options.search,
        columnFilter: ['batch.product.name', 'batch.batchCode'],
      });

      return {
        data: response.data,
        totalRows: response.meta?.rowsCount || 0,
      };
    } catch (error) {
      console.log(error);
      return {
        data: [],
        totalRows: 0,
      };
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
    initialSortField: 'id',
    initialSortDirection: false,
  });

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
