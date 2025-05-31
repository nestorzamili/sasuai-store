'use client';
import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  Column,
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'date' | 'number' | 'boolean';
  options?: FilterOption[];
  handleFilterChange: (value: string) => void;
}

interface TableLayoutProps<TData = unknown> {
  data: TData[];
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
  columnFilters?: ColumnFiltersState;
  pagination?: PaginationState;
  enableSelection?: boolean | false;
  filters?: FilterConfig[];
  setColumnFilters?: (columnFilters: ColumnFiltersState) => void;
  handlePaginationChange?: (pagination: PaginationState) => void;
  handleSortingChange?: (sorting: SortingState) => void;
  handleSearchChange?: (search: string) => void;
  totalRows?: number;
  uniqueIdField?: string;
  onSelectionChange?: (selectedIds: Record<string, boolean>) => void;
  initialSelectedRows?: Record<string, boolean>;
  filterToolbar?: React.ReactNode;
}

export function TableLayout<TData = unknown>({
  data,
  columns,
  isLoading = false,
  pagination,
  columnFilters,
  enableSelection = false,
  filters = [],
  handleSearchChange,
  handlePaginationChange,
  handleSortingChange,
  setColumnFilters,
  totalRows = 1,
  uniqueIdField = 'id',
  onSelectionChange,
  initialSelectedRows = {},
  filterToolbar,
}: TableLayoutProps<TData>) {
  const t = useTranslations('common.table');
  const [searchValue, setSearchValue] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] =
    React.useState<Record<string, boolean>>(initialSelectedRows);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!handleSearchChange) return;

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      handleSearchChange(searchValue);
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchValue, handleSearchChange]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(rowSelection);
    }
  }, [rowSelection, onSelectionChange]);

  const table = useReactTable({
    data,
    columns,
    rowCount: totalRows,
    manualSorting: Boolean(handleSortingChange),
    manualPagination: Boolean(handlePaginationChange),
    manualFiltering: Boolean(setColumnFilters),
    enableRowSelection: enableSelection,
    getRowId: (row) => String(row[uniqueIdField]),
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

        if (sorting.length > 0 && newSorting.length > 0) {
          const currentSort = sorting[0];
          const newSort = newSorting[0];

          if (currentSort.id === newSort.id) {
            if (currentSort.desc === false) {
              setSorting([{ id: currentSort.id, desc: true }]);
              handleSortingChange([{ id: currentSort.id, desc: true }]);
              return;
            } else if (currentSort.desc === true) {
              setSorting([]);
              handleSortingChange([]);
              return;
            }
          }
        }

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
      rowSelection: rowSelection,
    },
    onRowSelectionChange: setRowSelection,
  });

  const SortingButtonTable = ({
    column,
    label,
  }: {
    column: Column<TData, unknown>;
    label: string;
  }) => {
    const isSortable = column.getCanSort();

    const handleClick = () => {
      if (isSortable) {
        column.toggleSorting(column.getIsSorted() === 'asc');
      }
    };

    return (
      <button
        onClick={handleClick}
        disabled={isLoading || !isSortable}
        className={`group flex items-center justify-between text-left text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors ${
          isSortable ? 'hover:text-foreground cursor-pointer' : 'cursor-default'
        }`}
      >
        <span>{label}</span>
        {isSortable && (
          <div className="flex items-center">
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-3.5 w-3.5" />
            ) : (
              <div className="h-3.5 w-3.5 opacity-0 group-hover:opacity-40"></div>
            )}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search input */}
        <div className="w-[250px] lg:w-[300px]">
          <Input
            placeholder={t('search')}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="h-9"
          />
        </div>

        {/* Filter toolbar - positioned directly next to search */}
        {filterToolbar && (
          <div className="flex-1 flex items-center flex-wrap gap-2">
            {filterToolbar}
          </div>
        )}

        {/* Standard filters if no custom toolbar */}
        {!filterToolbar && filters && filters.length > 0 && (
          <div className="flex items-center flex-wrap gap-2">
            {filters.map((filter) => (
              <div key={filter.id} className="flex items-center">
                {filter.type === 'select' && filter.options && (
                  <Select onValueChange={filter.handleFilterChange}>
                    <SelectTrigger className="h-9 w-[150px]">
                      <SelectValue placeholder={filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options.map((option) => (
                        <SelectItem
                          key={`${filter.id}-${option.value}`}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-md border relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        <Table className="">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {enableSelection && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={table.getIsAllPageRowsSelected()}
                      onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                      }
                      aria-label={t('selectAll')}
                      className="ml-2"
                    />
                  </TableHead>
                )}
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    <SortingButtonTable
                      label={
                        header.isPlaceholder
                          ? ''
                          : (flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            ) as string)
                      }
                      column={header.column}
                    />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="text-md">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {enableSelection && (
                    <TableCell className="w-10">
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label={`${t('selectRow')} ${row.id}`}
                        className="ml-2"
                      />
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={
                    enableSelection ? columns.length + 1 : columns.length
                  }
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 py-4">
                    <p className="text-lg font-medium">{t('noResults')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('noResultsDescription')}
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
