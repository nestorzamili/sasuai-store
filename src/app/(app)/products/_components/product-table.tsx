'use client';

import * as React from 'react';
import { useMemo, useState, useCallback } from 'react';
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
import { ProductWithRelations } from '@/lib/types/product';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { ProductTableSkeleton } from './product-skeleton';
import { ProductDeleteDialog } from './product-delete-dialog';
import { Input } from '@/components/ui/input';
import { formatRupiah } from '@/lib/currency';

interface ProductTableProps {
  data: ProductWithRelations[];
  isLoading?: boolean;
  onEdit?: (product: ProductWithRelations) => void;
  onRefresh?: () => void;
}

export function ProductTable({
  data,
  isLoading = false,
  onEdit,
  onRefresh,
}: ProductTableProps) {
  // State for deletion dialog
  const [selectedProductForDelete, setSelectedProductForDelete] =
    useState<ProductWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Handlers
  const handleDeleteClick = useCallback((product: ProductWithRelations) => {
    setSelectedProductForDelete(product);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  // Define columns - memoize to prevent unnecessary recreations
  const columns = useMemo<ColumnDef<ProductWithRelations>[]>(
    () => [
      // Selection column - improved checkbox implementation
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
        size: 40, // Fixed width for the checkbox column
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
        cell: ({ row }) => {
          return <div>{row.original.barcode || 'N/A'}</div>;
        },
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
                    onClick={() => handleDeleteClick(product)}
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
    [handleDeleteClick, onEdit],
  );

  // Create table instance with memoized dependencies
  const table = useReactTable({
    data,
    columns,
    globalFilterFn: 'includesString',
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: searchQuery,
    },
  });

  // Apply global filter when search query changes
  React.useEffect(() => {
    table.setGlobalFilter(searchQuery);
  }, [searchQuery, table]);

  // Show skeleton while loading
  if (isLoading) {
    return <ProductTableSkeleton />;
  }

  return (
    <>
      {/* Search input */}
      <div className="space-y-4">
        <Input
          placeholder="Search products by name, barcode..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="max-w-sm"
        />

        {/* Table */}
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
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
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

        <DataTablePagination table={table} />
      </div>

      {/* Delete dialog - Only render when needed */}
      {isDeleteDialogOpen && selectedProductForDelete && (
        <ProductDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          product={selectedProductForDelete}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
