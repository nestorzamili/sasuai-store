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
import { Loader2 } from 'lucide-react';
import { ArrowUp, ArrowDown } from 'lucide-react';
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
  columnFilters,
  handleSearchChange,
  handlePaginationChange,
  handleSortingChange,
  setColumnFilters,
  totalRows = 1,
}: TableProps) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([]);
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

    // Show the loading indicator
    setIsSearching(true);

    // Set a new timeout for debouncing
    searchTimeout.current = setTimeout(() => {
      handleSearchChange(searchValue);
      setIsSearching(false);
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

        // Check if we're toggling the same column
        if (sorting.length > 0 && newSorting.length > 0) {
          const currentSort = sorting[0];
          const newSort = newSorting[0];

          // If same column, toggle between asc, desc, and none
          if (currentSort.id === newSort.id) {
            // If currently ascending, switch to descending
            if (currentSort.desc === false) {
              setSorting([{ id: currentSort.id, desc: true }]);
              handleSortingChange([{ id: currentSort.id, desc: true }]);
              return;
            }
            // If currently descending, remove sorting
            else if (currentSort.desc === true) {
              setSorting([]);
              handleSortingChange([]);
              return;
            }
          }
        }

        // Set the new sorting (for new column or initial sort)
        setSorting(newSorting);
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

  const SortingButtonTable = ({
    column,
    label,
  }: {
    column: any;
    label: string;
  }) => {
    const handleClick = () => {
      column.toggleSorting(column.getIsSorted() === 'asc');
    };

    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="group flex items-center justify-between text-left text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{label}</span>
        <div className="flex items-center">
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="h-3.5 w-3.5" />
          ) : (
            <div className="h-3.5 w-3.5 opacity-0 group-hover:opacity-40"></div>
          )}
        </div>
      </button>
    );
  };
  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="relative max-w-sm w-full">
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pr-8"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    <SortingButtonTable
                      label={
                        header.isPlaceholder
                          ? ''
                          : (flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            ) as string)
                      }
                      column={header.column}
                    />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="text-xs">
            {isLoading ? (
              // Loading state
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 py-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Loading data...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
