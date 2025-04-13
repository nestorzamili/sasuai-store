'use client';
import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState, useEffect, useRef } from 'react';

interface TableProps {
  data: any[];
  columns: ColumnDef<any>[];
  isLoading?: boolean;
  columnFilters?: ColumnFiltersState;
  sorting?: SortingState;
  pagination?: PaginationState;
  setColumnFilters?: (columnFilters: ColumnFiltersState) => void;
  handlePaginationChange?: (pagination: PaginationState) => void;
  handleSortingChange?: (sorting: SortingState) => void;
  handleSearchChange?: (search: string) => void;
  totalRows?: number;
}

export function TableLayout({
  data,
  columns,
  isLoading = false,
  pagination,
  sorting,
  columnFilters,
  handleSearchChange,
  handlePaginationChange,
  handleSortingChange,
  setColumnFilters,
  totalRows = 1,
}: TableProps) {
  const [searchValue, setSearchValue] = useState<string>('');
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Use a ref to prevent the effect from running on initial render
  const isInitialMount = useRef(true);

  // Handle search input changes with debounce
  useEffect(() => {
    // Skip the first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!handleSearchChange) return;

    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set a new timeout for debouncing
    searchTimeout.current = setTimeout(() => {
      handleSearchChange(searchValue);
    }, 500);

    // Cleanup function
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchValue]);

  const table = useReactTable({
    data,
    columns,
    rowCount: totalRows,
    // Enable manual control when handlers are provided
    manualSorting: Boolean(handleSortingChange),
    manualPagination: Boolean(handlePaginationChange),
    manualFiltering: Boolean(setColumnFilters),

    onPaginationChange: (updater) => {
      if (handlePaginationChange) {
        const newPagination =
          typeof updater === 'function'
            ? updater(pagination || { pageIndex: 0, pageSize: 10 })
            : updater;
        handlePaginationChange(newPagination);
      }
    },

    onSortingChange: (updater) => {
      if (handleSortingChange) {
        const newSorting =
          typeof updater === 'function' ? updater(sorting || []) : updater;
        handleSortingChange(newSorting);
      }
    },

    onColumnFiltersChange: (updater) => {
      if (setColumnFilters) {
        const newFilters =
          typeof updater === 'function'
            ? updater(columnFilters || [])
            : updater;
        setColumnFilters(newFilters);
      }
    },

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),

    state: {
      pagination: pagination || { pageIndex: 0, pageSize: 10 },
      sorting: sorting || [],
      columnFilters: columnFilters || [],
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array(5)
                .fill(0)
                .map((_, rowIndex) => (
                  <TableRow key={`skeleton-row-${rowIndex}`}>
                    {columns.map((_, cellIndex) => (
                      <TableCell key={`skeleton-cell-${rowIndex}-${cellIndex}`}>
                        <div className="h-6 w-full animate-pulse rounded bg-muted"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            ) : table.getRowModel().rows?.length ? (
              // Table data rows
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Empty state
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 py-4">
                    <p className="text-lg font-medium">No results found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filter to find what you're
                      looking for.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
