'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
  IconTrash,
  IconEdit,
  IconEye,
  IconGift,
  IconBan,
  IconShieldCheck,
} from '@tabler/icons-react';

// Custom Components
import { MemberTierBadge } from './member-tier-badge';
import { MemberDeleteDialog } from './member-delete-dialog';
import { MemberBanDialog } from './member-ban-dialog';
import { TableLayout } from '@/components/layout/table-layout';

// Hooks
import { useFetch } from '@/hooks/use-fetch';
import { toast } from '@/hooks/use-toast';

// Types
import type {
  MemberWithTier,
  MemberTableProps,
  TableFilter,
  MemberTier,
  MemberResponse,
} from '@/lib/types/member';
import { mapToMemberWithTier } from '@/lib/types/member';
import type { SortByOptions, TableFetchOptions } from '@/hooks/use-fetch';

// Actions
import { searchMembers, getAllMemberTiers, unbanMember } from '../action';

export function MemberTable({ onEdit, onAwardPoints }: MemberTableProps) {
  const t = useTranslations('member.table');
  const router = useRouter();

  // State for dialogs
  const [selectedMemberForDelete, setSelectedMemberForDelete] =
    useState<MemberWithTier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMemberForBan, setSelectedMemberForBan] =
    useState<MemberWithTier | null>(null);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);

  // State for filters
  const [memberTiers, setMemberTiers] = useState<MemberTier[]>([]);

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

  // Data fetching function - stabilize with useCallback
  const fetchData = useCallback(async (options: TableFetchOptions) => {
    try {
      const response = await searchMembers({
        query: options.search || '',
        page: (options.page ?? 0) + 1,
        limit: options.limit ?? 10,
        sortBy: options.sortBy?.id || 'name',
        sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
        tier: (options.filters?.tier as string) || '',
        isBanned: options.filters?.isBanned as boolean | undefined,
      });

      if (response.success) {
        const mappedMembers = (response.members || []).map((member) =>
          mapToMemberWithTier(member as MemberResponse),
        );
        return {
          data: mappedMembers,
          totalRows: response.totalCount || 0,
        };
      }

      return {
        data: [],
        totalRows: 0,
      };
    } catch (error) {
      console.error('Error fetching members:', error);
      return {
        data: [],
        totalRows: 0,
      };
    }
  }, []); // Empty dependency array since searchMembers is stable

  // Use fetch hook - moved before callbacks that use refresh
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
    fetchData,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'name',
    initialSortDirection: false,
  });

  // Event handlers - now refresh is available
  const handleDeleteClick = useCallback((member: MemberWithTier) => {
    setSelectedMemberForDelete(member);
    setIsDeleteDialogOpen(true);
  }, []);

  const viewMemberDetails = useCallback(
    (member: MemberWithTier) => {
      router.push(`/members/${member.id}`);
    },
    [router],
  );

  const handleUnban = useCallback(
    async (member: MemberWithTier) => {
      try {
        const result = await unbanMember(member.id);
        if (result.success) {
          toast({
            title: t('actions.unban.success'),
            description: t('actions.unban.successMessage', {
              name: member.name,
            }),
          });
          refresh();
        } else {
          toast({
            title: t('common.error'),
            description: result.error || t('actions.unban.failed'),
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Failed to unban member:', error);
        toast({
          title: t('common.error'),
          description: t('common.unexpectedError'),
          variant: 'destructive',
        });
      }
    },
    [refresh, t],
  );

  const handleBanMember = useCallback((member: MemberWithTier) => {
    setSelectedMemberForBan(member);
    setIsBanDialogOpen(true);
  }, []);

  // Table columns definition - memoize to prevent re-creation
  const columns: ColumnDef<MemberWithTier>[] = useMemo(
    () => [
      {
        accessorKey: 'cardId',
        header: t('columns.cardId'),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('cardId')}</div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: t('columns.name'),
        cell: ({ row }) => (
          <div className="font-medium uppercase">{row.getValue('name')}</div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'phone',
        header: t('columns.phone'),
        cell: ({ row }) => (
          <div className="font-medium text-xs text-muted-foreground">
            {row.getValue('phone')}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'address',
        header: t('columns.address'),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs uppercase">
            {row.original.address}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: 'tier',
        header: t('columns.tier'),
        cell: ({ row }) => {
          const tier = row.original.tier;
          if (!tier) {
            return (
              <span className="text-xs italic text-muted-foreground">
                {t('status.noTier')}
              </span>
            );
          }
          return <MemberTierBadge tier={tier} />;
        },
        enableSorting: false,
      },
      {
        accessorKey: 'totalPoints',
        header: t('columns.totalPoints'),
        cell: ({ row }) => (
          <div className="font-medium ml-4">
            {Number(row.original.totalPoints).toLocaleString()}
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: 'joinDate',
        header: t('columns.joinDate'),
        cell: ({ row }) => {
          const joinDate = row.original.joinDate;
          return (
            <div className="font-medium ml-4">
              {joinDate ? format(new Date(joinDate), 'MMMM dd, yyyy') : 'N/A'}
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: 'status',
        header: t('columns.status'),
        cell: ({ row }) => {
          const isBanned = row.original.isBanned;
          return isBanned ? (
            <Badge variant="destructive" className="whitespace-nowrap">
              <IconBan className="h-3 w-3 mr-1" /> {t('status.banned')}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="whitespace-nowrap bg-green-50 text-green-700 border-green-200"
            >
              {t('status.active')}
            </Badge>
          );
        },
        enableSorting: false,
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
                    <span className="sr-only">{t('actions.openMenu')}</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => viewMemberDetails(member)}
                  >
                    {t('actions.viewDetails')} <IconEye className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => onEdit?.(member)}
                  >
                    {t('actions.edit')} <IconEdit className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => onAwardPoints(member)}
                  >
                    {t('actions.awardPoints')} <IconGift className="h-4 w-4" />
                  </DropdownMenuItem>
                  {member.isBanned ? (
                    <DropdownMenuItem
                      className="flex justify-between cursor-pointer text-green-600 focus:text-green-600"
                      onClick={() => handleUnban(member)}
                    >
                      {t('actions.unban.button')}{' '}
                      <IconShieldCheck className="h-4 w-4" />
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      className="flex justify-between cursor-pointer text-amber-600 focus:text-amber-600"
                      onClick={() => handleBanMember(member)}
                    >
                      {t('actions.ban')} <IconBan className="h-4 w-4" />
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(member)}
                  >
                    {t('actions.delete')} <IconTrash className="h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [
      t,
      viewMemberDetails,
      onEdit,
      onAwardPoints,
      handleUnban,
      handleBanMember,
      handleDeleteClick,
    ],
  );

  // Event handlers for table interactions - stabilize with useCallback
  const handlePaginationChange = useCallback(
    (newPagination: { pageIndex: number; pageSize: number }) => {
      setPage(newPagination.pageIndex);
      setLimit(newPagination.pageSize);
    },
    [setPage, setLimit],
  );

  const handleSortingChange = useCallback(
    (newSorting: SortByOptions[]) => {
      setSortBy(newSorting);
    },
    [setSortBy],
  );

  const handleSearchChange = useCallback(
    (search: string) => {
      setSearch(search);
    },
    [setSearch],
  );

  // Filter handling with proper types - stabilize with useCallback
  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === 'tier') {
        if (value === 'ALL_TIERS') {
          setFilters((prev) => {
            const newFilters = { ...prev };
            delete newFilters[key];
            return newFilters;
          });
          return;
        }
      }

      if (key === 'isBanned') {
        const actualValue: boolean | undefined =
          value === 'ALL_STATUS'
            ? undefined
            : value === 'true'
              ? true
              : value === 'false'
                ? false
                : undefined;

        setFilters((prev) => ({
          ...prev,
          [key]: actualValue,
        }));
        return;
      }

      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setFilters],
  );

  // Filter options - memoize to prevent re-creation
  const filters: TableFilter[] = useMemo(
    () => [
      {
        id: 'tier',
        label: t('filters.tier'),
        type: 'select',
        options: [
          { value: 'ALL_TIERS', label: t('filters.allTiers') },
          ...memberTiers.map((tier) => ({
            value: tier.name,
            label: tier.name,
          })),
        ],
        handleFilterChange: (value) => handleFilterChange('tier', value),
      },
      {
        id: 'isBanned',
        label: t('filters.status'),
        type: 'select',
        options: [
          { value: 'ALL_STATUS', label: t('filters.allStatus') },
          { value: 'false', label: t('status.active') },
          { value: 'true', label: t('status.banned') },
        ],
        handleFilterChange: (value) => handleFilterChange('isBanned', value),
      },
    ],
    [memberTiers, handleFilterChange, t],
  );

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
        filters={filters}
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
