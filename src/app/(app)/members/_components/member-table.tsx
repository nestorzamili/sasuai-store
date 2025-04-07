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
import { IconTrash, IconEdit, IconEye } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { MemberTierBadge } from './member-tier-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MemberWithTier } from '@/lib/types/member';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { MemberDeleteDialog } from './member-delete-dialog';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface MemberTableProps {
  data: MemberWithTier[];
  isLoading?: boolean;
  onEdit?: (member: MemberWithTier) => void;
  onRefresh?: () => void;
  onSearch?: (query: string) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onPaginate?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
}

export function MemberTable({
  data,
  isLoading = false,
  onEdit,
  onRefresh,
  onSearch,
  onSort,
  onPaginate,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
}: MemberTableProps) {
  const router = useRouter();
  // State for deletion dialog
  const [selectedMemberForDelete, setSelectedMemberForDelete] =
    useState<MemberWithTier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Handlers
  const handleDeleteClick = (member: MemberWithTier) => {
    setSelectedMemberForDelete(member);
    setIsDeleteDialogOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeoutId = setTimeout(() => {
      onSearch?.(value);
    }, 500);

    setDebounceTimeout(timeoutId);
  };

  const handleSortChange = (column: string) => {
    const direction = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(direction);
    setSortColumn(column);
    onSort?.(column, direction);
  };

  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const viewMemberDetails = (member: MemberWithTier) => {
    router.push(`/members/${member.id}`);
  };

  // Define columns
  const columns: ColumnDef<MemberWithTier>[] = [
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
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSortChange('name')}
          className="flex items-center"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },

    // Contact column (email/phone)
    {
      id: 'contact',
      header: 'Contact',
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div>
            {member.email && <div className="text-sm">{member.email}</div>}
            {member.phone && (
              <div className="text-xs text-muted-foreground">
                {member.phone}
              </div>
            )}
            {!member.email && !member.phone && (
              <span className="text-xs italic text-muted-foreground">
                No contact info
              </span>
            )}
          </div>
        );
      },
    },

    // Tier column
    {
      id: 'tier',
      header: 'Membership Tier',
      cell: ({ row }) => {
        const tier = row.original.tier;
        if (!tier)
          return (
            <span className="text-xs italic text-muted-foreground">
              No tier
            </span>
          );
        return <MemberTierBadge tier={tier} />;
      },
    },

    // Points column
    {
      accessorKey: 'totalPoints',
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSortChange('totalPoints')}
          className="flex items-center"
        >
          Points
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('totalPoints')}</div>
      ),
    },

    // Join date column
    {
      accessorKey: 'joinDate',
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSortChange('joinDate')}
          className="flex items-center"
        >
          Join Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const joinDate = row.original.joinDate;
        return (
          <div className="font-medium">
            {format(new Date(joinDate), 'MMM d, yyyy')}
          </div>
        );
      },
    },

    // Actions column
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const member = row.original;
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
                  onClick={() => viewMemberDetails(member)}
                >
                  View Details <IconEye className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer"
                  onClick={() => onEdit?.(member)}
                >
                  Edit <IconEdit className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => handleDeleteClick(member)}
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Show skeleton while loading
  if (isLoading) {
    return <MemberTableSkeleton />;
  }

  return (
    <>
      {/* Search input */}
      <div className="space-y-4">
        <Input
          placeholder="Search members..."
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
              {data.length > 0 ? (
                data.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="p-4">
                      <Checkbox />
                    </TableCell>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>
                      {member.email && (
                        <div className="text-sm">{member.email}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.phone || (
                        <span className="text-xs italic text-muted-foreground">
                          No phone
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.tier ? (
                        <MemberTierBadge tier={member.tier} />
                      ) : (
                        <span className="text-xs italic text-muted-foreground">
                          No tier
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(member.joinDate), 'MMM d, yyyy')}
                    </TableCell>
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
                          <DropdownMenuItem
                            className="flex justify-between cursor-pointer"
                            onClick={() => viewMemberDetails(member)}
                          >
                            View Details <IconEye className="h-4 w-4" />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex justify-between cursor-pointer"
                            onClick={() => onEdit?.(member)}
                          >
                            Edit <IconEdit className="h-4 w-4" />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(member)}
                          >
                            Delete <IconTrash className="h-4 w-4" />
                          </DropdownMenuItem>
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
                    No members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Custom pagination for server-side pagination */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {totalItems > 0 ? (
              <span>
                Showing page {currentPage} of {totalPages} ({totalItems} total
                members)
              </span>
            ) : (
              <span>No results</span>
            )}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginate?.(1)}
              disabled={currentPage <= 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginate?.(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginate?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginate?.(totalPages)}
              disabled={currentPage >= totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      </div>

      {/* Delete dialog */}
      {selectedMemberForDelete && (
        <MemberDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          member={selectedMemberForDelete}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}

// Skeleton component for loading state
function MemberTableSkeleton() {
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
                <Skeleton className="h-7 w-32" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-28" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-20" />
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
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-10" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-28" />
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
