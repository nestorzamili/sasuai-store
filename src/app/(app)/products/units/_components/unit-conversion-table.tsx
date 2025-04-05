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
import { ArrowRight, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UnitConversionWithUnits, UnitWithCounts } from '@/lib/types/unit';
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
import { Input } from '@/components/ui/input';
import { UnitConversionDeleteDialog } from './unit-conversion-delete-dialog';

interface UnitConversionTableProps {
  data: UnitConversionWithUnits[];
  units: UnitWithCounts[];
  isLoading?: boolean;
  onEdit?: (conversion: UnitConversionWithUnits) => void;
  onRefresh?: () => void;
}

export function UnitConversionTable({
  data,
  isLoading = false,
  onEdit,
  onRefresh,
}: UnitConversionTableProps) {
  // State for deletion dialog
  const [selectedConversionForDelete, setSelectedConversionForDelete] =
    useState<UnitConversionWithUnits | null>(null);
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

  // Handle delete click
  const handleDeleteClick = (conversion: UnitConversionWithUnits) => {
    setSelectedConversionForDelete(conversion);
    setIsDeleteDialogOpen(true);
  };

  // Filter function for global search
  const fuzzyFilter = React.useCallback(
    (row: UnitConversionWithUnits, query: string) => {
      if (!query) return true;
      const searchLower = query.toLowerCase();
      return (
        row.fromUnit.name.toLowerCase().includes(searchLower) ||
        row.fromUnit.symbol.toLowerCase().includes(searchLower) ||
        row.toUnit.name.toLowerCase().includes(searchLower) ||
        row.toUnit.symbol.toLowerCase().includes(searchLower)
      );
    },
    [],
  );

  // Define columns
  const columns: ColumnDef<UnitConversionWithUnits>[] = [
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

    // From Unit column
    {
      accessorKey: 'fromUnit',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          From Unit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const fromUnit = row.original.fromUnit;
        return (
          <div className="font-medium">
            {fromUnit.name} ({fromUnit.symbol})
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.fromUnit.name.localeCompare(
          rowB.original.fromUnit.name,
        );
      },
    },

    // Arrow column
    {
      id: 'arrow',
      header: '',
      cell: () => (
        <div className="flex justify-center">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // To Unit column
    {
      accessorKey: 'toUnit',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          To Unit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const toUnit = row.original.toUnit;
        return (
          <div className="font-medium">
            {toUnit.name} ({toUnit.symbol})
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.toUnit.name.localeCompare(
          rowB.original.toUnit.name,
        );
      },
    },

    // Factor column
    {
      accessorKey: 'conversionFactor',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-center"
        >
          Factor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.original.conversionFactor}
        </div>
      ),
    },

    // Explanation column
    {
      id: 'explanation',
      header: 'Explanation',
      cell: ({ row }) => {
        const conversion = row.original;
        return (
          <div className="text-sm">
            1 {conversion.fromUnit.name} ({conversion.fromUnit.symbol}) ={' '}
            {conversion.conversionFactor} {conversion.toUnit.name} (
            {conversion.toUnit.symbol})
          </div>
        );
      },
    },

    // Actions column
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const conversion = row.original;
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
                  onClick={() => onEdit?.(conversion)}
                >
                  Edit <IconEdit className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => handleDeleteClick(conversion)}
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
    },
  });

  // Filtered data for search
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;
    return data.filter((conversion) => fuzzyFilter(conversion, searchQuery));
  }, [data, searchQuery, fuzzyFilter]);

  // Show skeleton while loading
  if (isLoading) {
    return <UnitConversionTableSkeleton />;
  }

  return (
    <>
      {/* Search input */}
      <div className="space-y-4">
        <Input
          placeholder="Search conversions..."
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
              {filteredData.length > 0 ? (
                filteredData.map((conversion) => {
                  const row = table
                    .getRowModel()
                    .rows.find((r) => r.original.id === conversion.id);
                  if (!row) return null;
                  return (
                    <TableRow
                      key={conversion.id}
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
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No unit conversions found.
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
      {selectedConversionForDelete && (
        <UnitConversionDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          conversion={selectedConversionForDelete}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}

// Skeleton component for loading state
function UnitConversionTableSkeleton() {
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
              <TableHead className="w-[40px]">
                <Skeleton className="h-7 w-6" />
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
