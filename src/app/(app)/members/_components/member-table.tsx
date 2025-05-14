'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  IconTrash,
  IconEdit,
  IconEye,
  IconGift,
  IconBan,
  IconShieldCheck,
} from '@tabler/icons-react';
import { MemberTierBadge } from './member-tier-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MemberWithTier } from '@/lib/types/member';
import { MemberDeleteDialog } from './member-delete-dialog';
import { MemberBanDialog } from './member-ban-dialog';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useFetch } from '@/hooks/use-fetch';
import { searchMembers, getAllMemberTiers, unbanMember } from '../action';
import { TableLayout } from '@/components/layout/table-layout';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface MemberTableProps {
  onEdit?: (member: MemberWithTier) => void;
  onAwardPoints: (member: MemberWithTier) => void;
}

export function MemberTable({ onEdit, onAwardPoints }: MemberTableProps) {
  const router = useRouter();
  const [selectedMemberForDelete, setSelectedMemberForDelete] =
    useState<MemberWithTier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMemberForBan, setSelectedMemberForBan] =
    useState<MemberWithTier | null>(null);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [memberTiers, setMemberTiers] = useState<any[]>([]);

  // Fetch member tiers for filters
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const response = await getAllMemberTiers();
        if (response.success && response.data) {
          setMemberTiers(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch member tiers:', error);
      }
    };

    fetchTiers();
  }, []);

  // Handlers
  const handleDeleteClick = (member: MemberWithTier) => {
    setSelectedMemberForDelete(member);
    setIsDeleteDialogOpen(true);
  };

  const viewMemberDetails = (member: MemberWithTier) => {
    router.push(`/members/${member.id}`);
  };

  const handleUnban = async (member: MemberWithTier) => {
    try {
      const result = await unbanMember(member.id);
      if (result.success) {
        toast({
          title: 'Member unbanned',
          description: `${member.name} has been unbanned successfully`,
        });
        refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to unban member',
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
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const isBanned = row.original.isBanned;
        return isBanned ? (
          <Badge variant="destructive" className="whitespace-nowrap">
            <IconBan className="h-3 w-3 mr-1" /> Banned
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="whitespace-nowrap bg-green-50 text-green-700 border-green-200"
          >
            Active
          </Badge>
        );
      },
    },
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
                {member.isBanned ? (
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer text-green-600 focus:text-green-600"
                    onClick={() => handleUnban(member)}
                  >
                    Unban Member <IconShieldCheck className="h-4 w-4" />
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer text-amber-600 focus:text-amber-600"
                    onClick={() => {
                      setSelectedMemberForBan(member);
                      setIsBanDialogOpen(true);
                    }}
                  >
                    Ban Member <IconBan className="h-4 w-4" />
                  </DropdownMenuItem>
                )}
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

  // Fetch data using searchMembers instead of optimalizeGetMember
  const fetchData = async (options: any) => {
    try {
      const response = await searchMembers({
        query: options.search || '',
        page: options.page + 1,
        limit: options.limit,
        sortBy: options.sortBy?.id || 'name',
        sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
        tier: options.filters?.tier || '',
        isBanned: options.filters?.isBanned,
      });

      if (response.success) {
        return {
          data: response.members || [],
          totalRows: response.totalCount || 0, // Ensure totalRows is always a number
        };
      }

      return {
        data: [],
        totalRows: 0, // Return 0 instead of undefined
      };
    } catch (error) {
      console.error('Error fetching members:', error);
      return {
        data: [],
        totalRows: 0, // Always return a number for totalRows
      };
    }
  };

  const {
    data: members,
    isLoading,
    options,
    setPage,
    setLimit,
    setSortBy,
    setSearch,
    setFilters,
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

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    if (key === 'tier') {
      if (value === 'ALL_TIERS') {
        setFilters((prev: any) => {
          const newFilters = { ...prev };
          delete newFilters[key];
          return newFilters;
        });
        return;
      }
    }

    if (key === 'isBanned') {
      const actualValue =
        value === 'ALL_STATUS'
          ? undefined
          : value === 'true'
          ? true
          : value === 'false'
          ? false
          : undefined;

      setFilters((prev: any) => ({
        ...prev,
        [key]: actualValue,
      }));
      return;
    }

    setFilters((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Define filter options
  const tierFilterOptions = [
    { value: 'ALL_TIERS', label: 'All Tiers' },
    ...memberTiers.map((tier) => ({
      value: tier.name,
      label: tier.name,
    })),
  ];

  const statusOptions = [
    { value: 'ALL_STATUS', label: 'All Status' },
    { value: 'false', label: 'Active' },
    { value: 'true', label: 'Banned' },
  ];

  return (
    <>
      <TableLayout
        data={members || []}
        columns={columns}
        isLoading={isLoading}
        pagination={options.pagination}
        handlePaginationChange={handlePaginationChange}
        handleSortingChange={handleSortingChange}
        handleSearchChange={handleSearchChange}
        totalRows={totalRows}
        enableSelection={true}
        filters={[
          {
            id: 'tier',
            label: 'Tier',
            type: 'select',
            options: tierFilterOptions,
            handleFilterChange: (value) => handleFilterChange('tier', value),
          },
          {
            id: 'isBanned',
            label: 'Status',
            type: 'select',
            options: statusOptions,
            handleFilterChange: (value) =>
              handleFilterChange('isBanned', value),
          },
        ]}
      />

      {selectedMemberForDelete && (
        <MemberDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          member={selectedMemberForDelete}
          onSuccess={refresh}
        />
      )}

      {selectedMemberForBan && (
        <MemberBanDialog
          open={isBanDialogOpen}
          onOpenChange={setIsBanDialogOpen}
          member={selectedMemberForBan}
          onSuccess={refresh}
        />
      )}
    </>
  );
}
