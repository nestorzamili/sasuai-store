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
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  IconTrash,
  IconEdit,
  IconEye,
  IconUser,
  IconMail,
  IconPhone,
  IconGift,
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
import { MemberDeleteDialog } from './member-delete-dialog';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useFetch } from '@/hooks/use-fetch';
import { optimalizeGetMember } from '../action';
import { TableLayout } from '@/components/layout/table-layout';

interface MemberTableProps {
  data: MemberWithTier[];
  isLoading?: boolean;
  onEdit?: (member: MemberWithTier) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onAwardPoints: (member: MemberWithTier) => void;
}

export function MemberTable({ onEdit, onAwardPoints }: MemberTableProps) {
  const router = useRouter();
  // State for deletion dialog
  const [selectedMemberForDelete, setSelectedMemberForDelete] =
    useState<MemberWithTier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Handlers
  const handleDeleteClick = (member: MemberWithTier) => {
    setSelectedMemberForDelete(member);
    setIsDeleteDialogOpen(true);
  };

  const viewMemberDetails = (member: MemberWithTier) => {
    router.push(`/members/${member.id}`);
  };
  // Define columns
  const columns: ColumnDef<MemberWithTier>[] = [
    {
      accessorKey: 'cardId',
      header: 'Card ID',
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue('cardId')}</div>;
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        return (
          <div className="font-medium uppercase">{row.getValue('name')}</div>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => {
        return (
          <div className="font-medium text-xs text-muted-foreground">
            {row.getValue('phone')}
          </div>
        );
      },
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => {
        return (
          <span className="text-muted-foreground text-xs uppercase">
            {row.original.address}
          </span>
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
      header: 'Total Point',
      cell: ({ row }) => {
        return (
          <div className="font-medium ml-4">
            {Number(row.original.totalPoints).toLocaleString()}
          </div>
        );
      },
    },

    {
      accessorKey: 'joinDate',
      header: 'Join Date',
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
      header: '',
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
                  className="flex justify-between cursor-pointer"
                  onClick={() => onAwardPoints(member)}
                >
                  Award Points <IconGift className="h-4 w-4" />
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
  // Fecth Data
  const fetchData = async (options: any) => {
    try {
      const response = await optimalizeGetMember({
        page: options.page + 1,
        limit: options.limit,
        sortBy: options.sortBy,
        search: options.search,
        columnFilter: ['id', 'name', 'cardId'],
      });
      return {
        data: response.data,
        totalRows: response.meta?.rowsCount || 0,
      };
    } catch (error) {
      console.log(error);
      return {
        data: [],
        totalRows: 0,
      };
    }
  };
  const {
    data,
    isLoading,
    options,
    setPage,
    setLimit,
    setSortBy,
    setSearch,
    totalRows,
    refresh,
  } = useFetch({
    fetchData: fetchData,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'name',
    initialSortDirection: false,
  });

  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setPage(newPagination.pageIndex);
    setLimit(newPagination.pageSize);
  };

  const handleSortingChange = (newSorting: any) => {
    setSortBy(newSorting);
  };

  const handleSearchChange = (search: string) => {
    setSearch(search);
  };
  return (
    <>
      <TableLayout
        data={data || []}
        columns={columns}
        isLoading={isLoading}
        pagination={options.pagination}
        handlePaginationChange={handlePaginationChange}
        handleSortingChange={handleSortingChange}
        handleSearchChange={handleSearchChange}
        totalRows={totalRows}
        enableSelection={true}
      />

      {/* Delete dialog */}
      {selectedMemberForDelete && (
        <MemberDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          member={selectedMemberForDelete}
          onSuccess={refresh}
        />
      )}
    </>
  );
}
