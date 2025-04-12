'use client';

import * as React from 'react';
import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ProductWithRelations,
  PaginatedProductResponse,
  ProductPaginationParams,
} from '@/lib/types/product';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductTableSkeleton } from './product-skeleton';
import { ProductDeleteDialog } from './product-delete-dialog';
import { Input } from '@/components/ui/input';
import { formatRupiah } from '@/lib/currency';
import { getPaginatedProducts } from '../action';
import { debounce } from '@/lib/common/debounce-effect';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductTableProps {
  initialData?: PaginatedProductResponse;
  onEdit?: (product: ProductWithRelations) => void;
  filterParams?: {
    isActive?: boolean;
    categoryId?: string;
    brandId?: string;
    search?: string; // Add the search property
  };
}

export function ProductTable({
  initialData,
  onEdit,
  filterParams,
}: ProductTableProps) {
  // Combine deletion dialog state
  const [deleteState, setDeleteState] = useState<{
    isOpen: boolean;
    product: ProductWithRelations | null;
  }>({
    isOpen: false,
    product: null,
  });

  // Server-side state with combined paginationData and loading state
  const [tableState, setTableState] = useState<{
    paginationData: PaginatedProductResponse;
    paginationParams: ProductPaginationParams;
    isLoading: boolean;
    searchQuery: string;
  }>({
    paginationData: initialData || {
      products: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    },
    paginationParams: {
      page: 1,
      pageSize: 10,
      sortField: 'name',
      sortDirection: 'asc',
      ...filterParams, // Apply filter params here
    },
    isLoading: !initialData,
    searchQuery: '',
  });

  // Table UI state
  const [tableUIState, setTableUIState] = useState<{
    sorting: SortingState;
    columnVisibility: VisibilityState;
    rowSelection: Record<string, boolean>;
  }>({
    sorting: [],
    columnVisibility: {},
    rowSelection: {},
  });

  // Create stable reference to debouncedSearch
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setTableState((prev) => ({
          ...prev,
          paginationParams: { ...prev.paginationParams, page: 1 },
          searchQuery: value,
        }));
      }, 300),
    [],
  );

  // Load data from server
  const loadData = useCallback(async () => {
    setTableState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await getPaginatedProducts({
        ...tableState.paginationParams,
        search: tableState.searchQuery,
        ...filterParams, // Make sure filterParams are applied on every load
      });

      if (response.success && response.data) {
        setTableState((prev) => ({
          ...prev,
          paginationData: response.data as PaginatedProductResponse,
          isLoading: false,
        }));
      } else {
        setTableState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setTableState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [tableState.paginationParams, tableState.searchQuery, filterParams]);

  // Initial data load
  useEffect(() => {
    if (!initialData) {
      loadData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect to load data when pagination params or search query change
  useEffect(() => {
    loadData();
  }, [tableState.paginationParams, tableState.searchQuery, loadData]);

  // Event handlers - combined and simplified
  const handlers = useMemo(
    () => ({
      // Delete handling
      onDeleteClick: (product: ProductWithRelations) => {
        setDeleteState({ isOpen: true, product });
      },

      onDeleteDialogChange: (isOpen: boolean) => {
        setDeleteState((prev) => ({ ...prev, isOpen }));
      },

      onDeleteSuccess: () => {
        loadData();
      },

      // Search handling
      onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value);
      },

      // Pagination handling
      onPageChange: (page: number) => {
        setTableState((prev) => ({
          ...prev,
          paginationParams: { ...prev.paginationParams, page },
        }));
      },

      onPageSizeChange: (pageSize: number) => {
        setTableState((prev) => ({
          ...prev,
          paginationParams: { ...prev.paginationParams, pageSize, page: 1 },
        }));
      },

      // Table navigation
      goToPage: (pageIndex: number) => {
        setTableState((prev) => ({
          ...prev,
          paginationParams: {
            ...prev.paginationParams,
            page: pageIndex + 1, // Convert to 1-indexed for server
          },
        }));
      },

      previousPage: () => {
        setTableState((prev) => ({
          ...prev,
          paginationParams: {
            ...prev.paginationParams,
            page: Math.max(1, prev.paginationParams.page - 1),
          },
        }));
      },

      nextPage: () => {
        setTableState((prev) => ({
          ...prev,
          paginationParams: {
            ...prev.paginationParams,
            page: Math.min(
              prev.paginationData.totalPages,
              prev.paginationParams.page + 1,
            ),
          },
        }));
      },

      setPageSize: (size: number) => {
        setTableState((prev) => ({
          ...prev,
          paginationParams: {
            ...prev.paginationParams,
            pageSize: size,
            page: 1,
          },
        }));
      },

      // Sorting handling
      onSortingChange: (
        updaterOrValue: SortingState | ((old: SortingState) => SortingState),
      ) => {
        const newSorting =
          typeof updaterOrValue === 'function'
            ? updaterOrValue(tableUIState.sorting)
            : updaterOrValue;

        setTableUIState((prev) => ({ ...prev, sorting: newSorting }));

        if (newSorting.length) {
          setTableState((prev) => ({
            ...prev,
            paginationParams: {
              ...prev.paginationParams,
              sortField: newSorting[0].id,
              sortDirection: newSorting[0].desc ? 'desc' : 'asc',
              page: 1,
            },
          }));
        }
      },

      // UI state changes
      onColumnVisibilityChange: (
        updaterOrValue:
          | VisibilityState
          | ((old: VisibilityState) => VisibilityState),
      ) => {
        const newVisibility =
          typeof updaterOrValue === 'function'
            ? updaterOrValue(tableUIState.columnVisibility)
            : updaterOrValue;

        setTableUIState((prev) => ({
          ...prev,
          columnVisibility: newVisibility,
        }));
      },

      onRowSelectionChange: (
        updaterOrValue:
          | Record<string, boolean>
          | ((old: Record<string, boolean>) => Record<string, boolean>),
      ) => {
        const newSelection =
          typeof updaterOrValue === 'function'
            ? updaterOrValue(tableUIState.rowSelection)
            : updaterOrValue;

        setTableUIState((prev) => ({ ...prev, rowSelection: newSelection }));
      },
    }),
    [debouncedSearch, loadData, tableUIState.sorting],
  );

  // Table columns definition - memoized
  const columns = useMemo<ColumnDef<ProductWithRelations>[]>(
    () => [
      // Selection column
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) => {
                table.toggleAllPageRowsSelected(!!value);
              }}
              aria-label="Select all"
              className="border-primary"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => {
                row.toggleSelected(!!value);
              }}
              aria-label="Select row"
              className="border-primary"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },

      // Product name column
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Product Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },

      // Description column
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
          const description = row.original.description || 'No description';
          return (
            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
              {description}
            </div>
          );
        },
        enableHiding: true,
      },

      // Category column
      {
        accessorKey: 'category.name',
        header: 'Category',
        cell: ({ row }) => <div>{row.original.category.name}</div>,
      },

      // Brand column
      {
        accessorKey: 'brand.name',
        header: 'Brand',
        cell: ({ row }) => <div>{row.original.brand?.name || 'N/A'}</div>,
      },

      // Barcode column
      {
        accessorKey: 'barcode',
        header: 'Barcode',
        cell: ({ row }) => <div>{row.original.barcode || 'N/A'}</div>,
      },

      // Price column
      {
        accessorKey: 'price',
        header: ({ column }) => (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              Price
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">{formatRupiah(row.original.price)}</div>
        ),
      },

      // Stock column
      {
        accessorKey: 'currentStock',
        header: ({ column }) => (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              Stock
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const stock = row.original.currentStock;
          return (
            <div className="flex items-center justify-center">
              <Badge
                variant={
                  stock <= 5
                    ? 'destructive'
                    : stock <= 10
                    ? 'secondary'
                    : 'outline'
                }
              >
                {stock} {row.original.unit.symbol}
              </Badge>
            </div>
          );
        },
      },

      // Status column
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => {
          return row.original.isActive ? (
            <Badge>Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          );
        },
      },

      // Actions column
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => onEdit?.(product)}
                  >
                    Edit <IconEdit className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => handlers.onDeleteClick(product)}
                  >
                    Delete <IconTrash className="h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [handlers, onEdit],
  );

  // Create table instance
  const table = useReactTable({
    data: tableState.paginationData.products,
    columns,
    pageCount: tableState.paginationData.totalPages,
    onSortingChange: handlers.onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: handlers.onColumnVisibilityChange,
    onRowSelectionChange: handlers.onRowSelectionChange,
    manualPagination: true,
    manualSorting: true,
    state: {
      sorting: tableUIState.sorting,
      columnVisibility: tableUIState.columnVisibility,
      rowSelection: tableUIState.rowSelection,
      pagination: {
        pageIndex: tableState.paginationParams.page - 1, // Convert to 0-indexed for table
        pageSize: tableState.paginationParams.pageSize,
      },
    },
  });

  // Show skeleton while loading initial data
  if (tableState.isLoading && !tableState.paginationData.products.length) {
    return <ProductTableSkeleton />;
  }

  return (
    <>
      <div className="rounded-md border relative">
        {tableState.isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
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
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {tableState.paginationData.products.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
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
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span className="mr-2">
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </span>
          )}
          <span>Total: {tableState.paginationData.totalCount} products</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Rows per page</span>
            <Select
              value={`${tableState.paginationParams.pageSize}`}
              onValueChange={(value) => {
                handlers.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={tableState.paginationParams.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex w-[120px] items-center justify-center text-sm font-medium">
              Page {tableState.paginationParams.page} of{' '}
              {tableState.paginationData.totalPages || 1}
            </div>

            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlers.goToPage(0)}
              disabled={tableState.paginationParams.page <= 1}
            >
              <span className="sr-only">Go to first page</span>
              <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={handlers.previousPage}
              disabled={tableState.paginationParams.page <= 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={handlers.nextPage}
              disabled={
                tableState.paginationParams.page >=
                tableState.paginationData.totalPages
              }
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() =>
                handlers.goToPage(tableState.paginationData.totalPages - 1)
              }
              disabled={
                tableState.paginationParams.page >=
                tableState.paginationData.totalPages
              }
            >
              <span className="sr-only">Go to last page</span>
              <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete dialog - Conditional rendering with short-circuit */}
      {deleteState.isOpen && deleteState.product && (
        <ProductDeleteDialog
          open={deleteState.isOpen}
          onOpenChange={handlers.onDeleteDialogChange}
          product={deleteState.product}
          onSuccess={handlers.onDeleteSuccess}
        />
      )}
    </>
  );
}
