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
import { IconEdit } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
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
import { updateClaimStatus } from '../actions';
import { toast } from '@/hooks/use-toast';

// Define claim structure
type RewardClaimWithRelations = {
  id: string;
  memberId: string;
  rewardId: string;
  claimDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  member: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  reward: {
    id: string;
    name: string;
    pointsCost: number;
  };
};

interface RewardClaimsTableProps {
  data: RewardClaimWithRelations[];
  totalCount: number;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  isLoading?: boolean;
  onPaginationChange?: (page: number, pageSize: number) => void;
  onSearchChange?: (query: string) => void;
  onStatusChange?: (status: string) => void;
}

export function RewardClaimsTable({
  data,
  totalCount,
  pageCount,
  pageIndex,
  pageSize,
  isLoading = false,
  onPaginationChange,
  onSearchChange,
  onStatusChange,
}: RewardClaimsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Handle status change
  const handleStatusChange = async (claimId: string, newStatus: string) => {
    try {
      const result = await updateClaimStatus(claimId, newStatus);

      if (result.success) {
        toast({
          title: 'Status updated',
          description: `Claim status has been changed to ${newStatus}`,
        });

        // Refresh the data if callback is provided
        if (onStatusChange) {
          onStatusChange(''); // Refresh all statuses
        }
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update claim status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Claimed':
        return <Badge variant="secondary">Claimed</Badge>;
      case 'Fulfilled':
        return (
          <Badge
            variant="secondary"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Fulfilled
          </Badge>
        );
      case 'Cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'Pending':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Define columns
  const columns: ColumnDef<RewardClaimWithRelations>[] = [
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
    {
      accessorKey: 'claimDate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Claim Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {format(new Date(row.getValue('claimDate')), 'PPp')}
        </div>
      ),
    },
    {
      accessorKey: 'member',
      header: 'Member',
      cell: ({ row }) => {
        const member = row.original.member;
        return <div className="font-medium">{member.name}</div>;
      },
    },
    {
      accessorKey: 'reward',
      header: 'Reward',
      cell: ({ row }) => {
        const reward = row.original.reward;
        return (
          <div className="font-medium">
            {reward.name}
            <span className="block text-xs text-muted-foreground">
              {reward.pointsCost} points
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const claim = row.original;
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
                <DropdownMenuLabel className="text-xs">
                  Change Status
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup value={claim.status}>
                  <DropdownMenuRadioItem
                    value="Claimed"
                    onClick={() => handleStatusChange(claim.id, 'Claimed')}
                  >
                    Claimed
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="Fulfilled"
                    onClick={() => handleStatusChange(claim.id, 'Fulfilled')}
                  >
                    Fulfilled
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="Cancelled"
                    onClick={() => handleStatusChange(claim.id, 'Cancelled')}
                  >
                    Cancelled
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="Pending"
                    onClick={() => handleStatusChange(claim.id, 'Pending')}
                  >
                    Pending
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Create table instance - we're using controlled pagination here
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: true, // Tell the table we're handling pagination
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearchChange) {
      // In real implementation, you might want to debounce this
      onSearchChange(e.target.value);
    }
  };

  // Handle pagination change
  const handlePaginationChange = (page: number) => {
    if (onPaginationChange) {
      onPaginationChange(page, pageSize);
    }
  };

  // Show skeleton while loading
  if (isLoading) {
    return <RewardClaimsTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search claims..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        <div className="ml-auto flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Filter Status</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onStatusChange?.('')}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange?.('Claimed')}>
                Claimed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange?.('Fulfilled')}>
                Fulfilled
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange?.('Cancelled')}>
                Cancelled
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange?.('Pending')}>
                Pending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="p-4">
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    {format(new Date(claim.claimDate), 'PPp')}
                  </TableCell>
                  <TableCell>{claim.member.name}</TableCell>
                  <TableCell>
                    {claim.reward.name}
                    <span className="block text-xs text-muted-foreground">
                      {claim.reward.pointsCost} points
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(claim.status)}</TableCell>
                  <TableCell className="text-right">
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
                        <DropdownMenuLabel className="text-xs">
                          Change Status
                        </DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={claim.status}>
                          <DropdownMenuRadioItem
                            value="Claimed"
                            onClick={() =>
                              handleStatusChange(claim.id, 'Claimed')
                            }
                          >
                            Claimed
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem
                            value="Fulfilled"
                            onClick={() =>
                              handleStatusChange(claim.id, 'Fulfilled')
                            }
                          >
                            Fulfilled
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem
                            value="Cancelled"
                            onClick={() =>
                              handleStatusChange(claim.id, 'Cancelled')
                            }
                          >
                            Cancelled
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem
                            value="Pending"
                            onClick={() =>
                              handleStatusChange(claim.id, 'Pending')
                            }
                          >
                            Pending
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No reward claims found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Custom pagination control for server-side pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {pageIndex * pageSize + 1} to{' '}
          {Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount}{' '}
          results
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePaginationChange(0)}
            disabled={pageIndex === 0}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePaginationChange(pageIndex - 1)}
            disabled={pageIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePaginationChange(pageIndex + 1)}
            disabled={pageIndex >= pageCount - 1}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePaginationChange(pageCount - 1)}
            disabled={pageIndex >= pageCount - 1}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}

// Skeleton for loading state
function RewardClaimsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-[384px]" />
        <div className="ml-auto">
          <Skeleton className="h-10 w-[150px]" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Skeleton className="h-6 w-6" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-32" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-32" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-32" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-24" />
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
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
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

      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-5 w-[200px]" />
        <div className="space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}
