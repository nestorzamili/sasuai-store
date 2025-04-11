'use client';
import * as React from 'react';
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
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  IconTrash,
  IconEdit,
  IconEye,
  IconAdjustmentsHorizontal,
} from '@tabler/icons-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { BatchTableSkeleton } from './batch-skeleton';
import { Input } from '@/components/ui/input';
import { ProductBatchWithProduct } from '@/lib/types/product-batch';
import { BatchDeleteDialog } from './batch-delete-dialog';
import { BatchDetailDialog } from './batch-detail-dialog';
import { formatDate } from '@/lib/date';
import { formatRupiah } from '@/lib/currency';

interface BatchTableProps {
  data: ProductBatchWithProduct[];
  isLoading?: boolean;
  onEdit?: (batch: ProductBatchWithProduct) => void;
  onAdjust?: (batch: ProductBatchWithProduct) => void;
  onRefresh?: () => void;
}

export function BatchTable({
  data,
  isLoading = false,
  onEdit,
  onAdjust,
  onRefresh,
}: BatchTableProps) {
  const [selectedBatchForDelete, setSelectedBatchForDelete] =
    useState<ProductBatchWithProduct | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New state for batch details dialog
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Handle delete click
  const handleDeleteClick = (batch: ProductBatchWithProduct) => {
    setSelectedBatchForDelete(batch);
    setIsDeleteDialogOpen(true);
  };

  // New handler for viewing batch details
  const handleViewDetails = (batch: ProductBatchWithProduct) => {
    setSelectedBatchId(batch.id);
    setIsDetailDialogOpen(true);
  };

  // Determine if a batch is expired
  const isExpired = (expiryDate: Date): boolean => {
    return new Date(expiryDate) < new Date();
  };

  // Define columns
  const columns: ColumnDef<ProductBatchWithProduct>[] = [
    // Selection column
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // Product column
    {
      accessorKey: 'product.name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const product = row.original.product;
        return <div className="font-medium">{product.name}</div>;
      },
    },

    // Batch Code column
    {
      accessorKey: 'batchCode',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Batch Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="ml-4">{row.getValue('batchCode')}</div>
      ),
    },

    // Expiry Date column
    {
      accessorKey: 'expiryDate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Expiry Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const expiryDate = new Date(row.getValue('expiryDate'));
        const expired = isExpired(expiryDate);

        return (
          <div className="flex ml-4">
            <div className={expired ? 'text-destructive font-medium' : ''}>
              {formatDate(expiryDate)}
            </div>
            {expired && (
              <Badge variant="destructive" className="ml-2">
                Expired
              </Badge>
            )}
          </div>
        );
      },
    },

    // Quantity column
    {
      accessorKey: 'remainingQuantity',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Remaining Qty
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const quantity = row.getValue('remainingQuantity') as number;
        return <div className="ml-4">{quantity.toLocaleString()}</div>;
      },
    },

    // Buy Price column
    {
      accessorKey: 'buyPrice',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Buy Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const buyPrice = row.getValue('buyPrice') as number;
        return <div className="ml-4 font-medium">{formatRupiah(buyPrice)}</div>;
      },
    },

    // Actions column
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const batch = row.original;
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
                  onClick={() => handleViewDetails(batch)}
                >
                  View Details <IconEye className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer"
                  onClick={() => onAdjust?.(batch)}
                >
                  Adjust Quantity{' '}
                  <IconAdjustmentsHorizontal className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer"
                  onClick={() => onEdit?.(batch)}
                >
                  Edit <IconEdit className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => handleDeleteClick(batch)}
                  disabled={batch.remainingQuantity !== batch.initialQuantity}
                >
                  Delete <IconTrash className="h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    onGlobalFilterChange: setSearchQuery,
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

  // Show skeleton while loading
  if (isLoading) {
    return <BatchTableSkeleton />;
  }

  return (
    <>
      {/* Search input */}
      <div className="space-y-4">
        <Input
          placeholder="Search batches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
                    data-state={row.getIsSelected() && 'selected'}
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4">
          <DataTablePagination table={table} />
        </div>
      </div>

      {/* Delete dialog */}
      {selectedBatchForDelete && (
        <BatchDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          batch={selectedBatchForDelete}
          onSuccess={onRefresh}
        />
      )}

      {/* Details dialog */}
      <BatchDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        batchId={selectedBatchId}
      />
    </>
  );
}
