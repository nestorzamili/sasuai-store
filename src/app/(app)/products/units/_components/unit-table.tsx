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
import { UnitWithCounts } from '@/lib/types/unit';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { UnitDeleteDialog } from './unit-delete-dialog';
import { Input } from '@/components/ui/input';

interface UnitTableProps {
  data: UnitWithCounts[];
  isLoading?: boolean;
  onEdit?: (unit: UnitWithCounts) => void;
  onRefresh?: () => void;
}

export function UnitTable({
  data,
  isLoading = false,
  onEdit,
  onRefresh,
}: UnitTableProps) {
  // State for deletion dialog
  const [selectedUnitForDelete, setSelectedUnitForDelete] =
    useState<UnitWithCounts | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Calculate if a unit is in use
  const isUnitInUse = (unit: UnitWithCounts): boolean => {
    return !!(
      (unit._count?.productVariants && unit._count.productVariants > 0) ||
      (unit._count?.stockIns && unit._count.stockIns > 0) ||
      (unit._count?.stockOuts && unit._count.stockOuts > 0) ||
      (unit._count?.transactionItems && unit._count.transactionItems > 0)
    );
  };

  // Handlers
  const handleDeleteClick = (unit: UnitWithCounts) => {
    setSelectedUnitForDelete(unit);
    setIsDeleteDialogOpen(true);
  };

  // Define columns
  const columns: ColumnDef<UnitWithCounts>[] = [
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

    // Name column
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Unit Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },

    // Symbol column
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      cell: ({ row }) => (
        <div className="font-mono">{row.getValue('symbol')}</div>
      ),
    },

    // Usage column
    {
      id: 'usage',
      header: 'Usage',
      cell: ({ row }) => {
        const unit = row.original;
        const counts = unit._count || {};
        const productVariants = counts.productVariants || 0;
        const stockIns = counts.stockIns || 0;
        const stockOuts = counts.stockOuts || 0;
        const transactions = counts.transactionItems || 0;

        return (
          <div className="flex flex-wrap gap-1">
            {productVariants > 0 && (
              <Badge variant="outline" className="text-xs">
                {productVariants} products
              </Badge>
            )}
            {stockIns > 0 && (
              <Badge variant="outline" className="text-xs">
                {stockIns} stock-ins
              </Badge>
            )}
            {stockOuts > 0 && (
              <Badge variant="outline" className="text-xs">
                {stockOuts} stock-outs
              </Badge>
            )}
            {transactions > 0 && (
              <Badge variant="outline" className="text-xs">
                {transactions} transactions
              </Badge>
            )}
            {productVariants === 0 &&
              stockIns === 0 &&
              stockOuts === 0 &&
              transactions === 0 && (
                <span className="text-muted-foreground italic text-xs">
                  Not in use
                </span>
              )}
          </div>
        );
      },
    },

    // Conversions column
    {
      id: 'conversions',
      header: 'Conversions',
      cell: ({ row }) => {
        const unit = row.original;
        const counts = unit._count || {};
        const fromConversions = counts.fromUnitConversions || 0;
        const toConversions = counts.toUnitConversions || 0;
        const totalConversions = fromConversions + toConversions;

        return (
          <Badge variant="outline" className="text-xs">
            {totalConversions} conversions
          </Badge>
        );
      },
    },

    // Actions column
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const unit = row.original;
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
                  onClick={() => onEdit?.(unit)}
                >
                  Edit <IconEdit className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => handleDeleteClick(unit)}
                  disabled={isUnitInUse(unit)}
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
    return <UnitTableSkeleton />;
  }

  return (
    <>
      {/* Search input */}
      <div className="space-y-4">
        <Input
          placeholder="Search units..."
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
      {selectedUnitForDelete && (
        <UnitDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          unit={selectedUnitForDelete}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}

// Skeleton component for loading state
function UnitTableSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-10 w-[384px]" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Skeleton className="h-6 w-6" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-40" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-28" />
              </TableHead>
              <TableHead className="w-[80px]">
                <Skeleton className="h-7 w-16" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-5 w-5" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-full max-w-[180px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-full max-w-[200px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-8" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between px-2">
          <Skeleton className="h-5 w-[200px]" />
          <div className="flex items-center space-x-6">
            <Skeleton className="h-8 w-[120px]" />
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-8 w-[120px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
