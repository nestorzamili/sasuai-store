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
import { IconTrash, IconEdit, IconTrophy } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RewardWithClaimCount } from '@/lib/types/reward';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { CountdownTimer } from '@/components/countdown-timer';
import { Skeleton } from '@/components/ui/skeleton';
import { RewardDeleteDialog } from './reward-delete-dialog';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface RewardTableProps {
  data: RewardWithClaimCount[];
  isLoading?: boolean;
  onEdit?: (reward: RewardWithClaimCount) => void;
  onDelete: (reward: RewardWithClaimCount) => void;
  onRefresh?: () => void;
}

export function RewardTable({
  data,
  isLoading = false,
  onEdit,
  onRefresh,
}: RewardTableProps) {
  // State for deletion dialog
  const [selectedRewardForDelete, setSelectedRewardForDelete] =
    useState<RewardWithClaimCount | null>(null);
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

  // Handlers
  const handleDeleteClick = (reward: RewardWithClaimCount) => {
    setSelectedRewardForDelete(reward);
    setIsDeleteDialogOpen(true);
  };

  // Define columns
  const columns: ColumnDef<RewardWithClaimCount>[] = [
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
          Reward Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          <IconTrophy className="mr-2 h-4 w-4 text-yellow-500" />
          <div className="font-medium">{row.getValue('name')}</div>
        </div>
      ),
    },

    // Points cost column
    {
      accessorKey: 'pointsCost',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Points Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium ml-4">
          {row.getValue('pointsCost')} points
        </div>
      ),
    },

    // Stock column
    {
      accessorKey: 'stock',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const stock = row.getValue('stock') as number;
        return (
          <div className="font-medium ml-4">
            {stock === 0 ? (
              <Badge variant="destructive">Out of Stock</Badge>
            ) : stock < 10 ? (
              <Badge
                variant="secondary"
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {stock} remaining
              </Badge>
            ) : (
              <Badge variant="outline">{stock}</Badge>
            )}
          </div>
        );
      },
    },

    // Active status column
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className={isActive ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },

    // Expiry date column
    {
      accessorKey: 'expiryDate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Expiry
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const expiryDate = row.original.expiryDate;
        if (!expiryDate)
          return (
            <span className="text-muted-foreground text-sm">No expiry</span>
          );

        const isExpired = new Date(expiryDate) < new Date();

        if (isExpired) {
          return (
            <div>
              <Badge variant="destructive">
                Expired:{' '}
                {format(new Date(expiryDate), "MMM d, yyyy 'at' h:mm a")}
              </Badge>
            </div>
          );
        }

        // Use CountdownTimer for active rewards
        return (
          <div className="flex flex-col gap-1">
            <CountdownTimer expiryDate={new Date(expiryDate)} />
            <span className="text-xs text-muted-foreground">
              {format(new Date(expiryDate), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
        );
      },
    },

    // Claims count column
    {
      id: 'claimsCount',
      header: 'Claims',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.original._count?.rewardClaims || 0} claims
        </Badge>
      ),
    },

    // Actions column
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const reward = row.original;
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
                  onClick={() => onEdit?.(reward)}
                >
                  Edit <IconEdit className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => handleDeleteClick(reward)}
                >
                  Delete <IconTrash className="h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ]; // Fixed the bracket closure here - it was missing the closing bracket

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
    return <RewardTableSkeleton />;
  }

  return (
    <>
      {/* Search input */}
      <div className="space-y-4">
        <Input
          placeholder="Search rewards..."
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
      {selectedRewardForDelete && (
        <RewardDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          reward={selectedRewardForDelete}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}

// Skeleton component for loading state
function RewardTableSkeleton() {
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
                <Skeleton className="h-7 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-20" />
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
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
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
