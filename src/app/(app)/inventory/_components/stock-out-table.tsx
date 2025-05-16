'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { StockOutComplete, StockMovement } from '@/lib/types/stock-movement';
import { format } from 'date-fns';
import { TableLayout } from '@/components/layout/table-layout';
import { useFetch } from '@/hooks/use-fetch';
import { getAllOptimalizedStockOuts } from '../stock-actions';
import { memo, useRef, useCallback } from 'react';

export const StockOutTable = memo(function StockOutTable() {
  // Track if this is the initial render
  const isInitialMount = useRef(true);

  // Format date function
  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'PPP');
  };

  // Define columns with proper type handling and improved UX
  const columns: ColumnDef<StockOutComplete | StockMovement>[] = [
    // Date column
    {
      accessorKey: 'date',
      header: 'date',
      cell: ({ row }) => formatDate(row.original.date),
    },

    // Product and Batch column
    {
      id: 'product',
      header: 'product name',
      cell: ({ row }) => {
        const productName = row.original.batch?.product?.name;
        return <div className="font-medium">{productName || 'Unknown'}</div>;
      },
      accessorFn: (row) => row.batch?.product?.name || '',
    },

    // Batch Code column
    {
      id: 'batchCode',
      header: 'batch code',
      cell: ({ row }) => {
        const batchCode = row.original.batch?.batchCode;
        return <div>{batchCode || 'N/A'}</div>;
      },
      accessorFn: (row) => row.batch?.batchCode || '',
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

    // Source/Type column with badges
    {
      id: 'source',
      header: 'source',
      cell: ({ row }) => {
        // Determine if it's a transaction or manual stock out
        const isTransaction =
          'transactionId' in row.original && row.original.transactionId;
        return isTransaction ? (
          <div>
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
            >
              Transaction
            </Badge>
          </div>
        ) : (
          <div>
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
            >
              Manual
            </Badge>
          </div>
        );
      },
      accessorFn: (row) =>
        'transactionId' in row && row.transactionId ? 'Transaction' : 'Manual',
    },
  ];

  // Memoize the fetch function to prevent it from changing on every render
  const fetchStockOutData = useCallback(async (options: any) => {
    try {
      // Skip initial fetch if not the first render
      if (!isInitialMount.current) {
        console.log('Fetching stock out data');
      }
      isInitialMount.current = false;

      const response = await getAllOptimalizedStockOuts({
        page: options.page + 1,
        limit: options.limit,
        sortBy: options.sortBy,
        search: options.search,
        columnFilter: ['batch.product.name', 'batch.batchCode'],
      });

      if (response.success) {
        return {
          data: response.data,
          totalRows: response.meta?.rowsCount || 0,
        };
      }
      return { data: [], totalRows: 0 };
    } catch (error) {
      console.log(error);
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
    fetchData: fetchStockOutData,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'date',
    initialSortDirection: true, // Newest first
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
