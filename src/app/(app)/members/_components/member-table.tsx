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
  IconUser,
  IconMail,
  IconPhone,
} from '@tabler/icons-react';
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
import { DataTablePagination } from '@/components/ui/data-table-pagination';
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
  totalPages = 1,
}: MemberTableProps) {
  const router = useRouter();
  // State for deletion dialog
  const [selectedMemberForDelete, setSelectedMemberForDelete] =
    useState<MemberWithTier | null>(null);
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
  const handleDeleteClick = (member: MemberWithTier) => {
    setSelectedMemberForDelete(member);
    setIsDeleteDialogOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce search
    if (onSearch) {
      const timeoutId = setTimeout(() => {
        onSearch(value);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  };

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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Member Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          <IconUser className="mr-2 h-4 w-4 text-blue-500" />
          <div className="font-medium">{row.getValue('name')}</div>
        </div>
      ),
    },

    // Email column
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const email = row.getValue('email') as string;
        return (
          <div className="flex items-center">
            {email ? (
              <>
                <IconMail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{email}</span>
              </>
            ) : (
              <span className="text-xs italic text-muted-foreground">
                Not provided
              </span>
            )}
          </div>
        );
      },
    },

    // Phone column
    {
      accessorKey: 'phone',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Phone
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const phone = row.getValue('phone') as string;
        return (
          <div className="flex items-center">
            {phone ? (
              <>
                <IconPhone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{phone}</span>
              </>
            ) : (
              <span className="text-xs italic text-muted-foreground">
                Not provided
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

    // Current Points column
    {
      accessorKey: 'totalPoints',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Current Points
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium ml-4">
            {Number(row.original.totalPoints).toLocaleString()}
          </div>
        );
      },
    },

    // Lifetime Points column
    {
      accessorKey: 'totalPointsEarned',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Lifetime Points
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground ml-4">
            {Number(row.original.totalPointsEarned).toLocaleString()}
          </div>
        );
      },
    },

    // Join date column
    {
      accessorKey: 'joinDate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Join Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const joinDate = row.original.joinDate;
        return (
          <div className="font-medium ml-4">
            {format(new Date(joinDate), 'MMMM dd, yyyy')}
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
    // Added pagination initialization
    manualPagination: true,
    pageCount: totalPages,
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

        <div className="mt-4">
          <DataTablePagination table={table} />
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
                <Skeleton className="h-7 w-32" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-28" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-28" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-7 w-28" />
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
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
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
