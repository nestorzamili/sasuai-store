'use client';

import { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StockInComplete } from '@/lib/types/stock-movement';
import { format } from 'date-fns';
import { SupplierWithCount } from '@/lib/types/supplier';
import { Checkbox } from '@/components/ui/checkbox';
import { TableLayout } from '@/components/layout/table-layout';
import { useFetch } from '@/hooks/use-fetch';
import { getAllOptimalizedStockIns } from '../stock-actions';
export function StockInTable() {
  // Table state

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

  const fetchDataTable = async (options: any) => {
    try {
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
  };

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
}
