'use client';
import * as React from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { TableLayout } from '@/components/layout/table-layout';
import { RewardClaimWithRelations } from '@/lib/types/reward';
import { useFetch } from '@/hooks/use-fetch';
import { getAllRewardClaims, updateClaimStatus } from '../actions';
import { toast } from '@/hooks/use-toast';

interface RewardClaimsTableProps {
  onStatusChange?: (claimId: string, status: string) => void;
  onRefresh?: () => void;
}

interface FetchOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: { id: string; desc: boolean };
  pagination?: unknown;
  [key: string]: unknown;
}

interface FetchResult<T = unknown> {
  data: T;
  totalRows: number;
  [key: string]: unknown;
}

// Status constants for better maintainability
const CLAIM_STATUSES = {
  CLAIMED: 'Claimed',
  FULFILLED: 'Fulfilled',
  CANCELLED: 'Cancelled',
  PENDING: 'Pending',
} as const;

export function RewardClaimsTable({
  onStatusChange,
  onRefresh,
}: RewardClaimsTableProps) {
  const t = useTranslations('reward.claimsTable');
  const tCommon = useTranslations('reward.common');

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchClaims = React.useCallback(
    async (
      options: FetchOptions,
    ): Promise<FetchResult<RewardClaimWithRelations[]>> => {
      const result = await getAllRewardClaims({
        page: (options.page ?? 0) + 1,
        limit: options.limit ?? 10,
        search: options.search ?? '',
        status:
          options.status && options.status !== 'all' ? options.status : '',
        sortBy: options.sortBy?.id || 'claimDate',
        sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
      });

      if (result.success && result.data) {
        return {
          data: result.data.claims || [],
          totalRows: result.data.totalCount || 0,
        };
      }

      return {
        data: [],
        totalRows: 0,
      };
    },
    [],
  );

  // Use fetch hook
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
  } = useFetch<RewardClaimWithRelations[]>({
    fetchData: fetchClaims,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'claimDate',
    initialSortDirection: true,
    options: {
      status: 'all',
    },
  });

  // Memoized handlers - stabilize with useCallback
  const handlePaginationChange = React.useCallback(
    (newPagination: { pageIndex: number; pageSize: number }): void => {
      setPage(newPagination.pageIndex);
      setLimit(newPagination.pageSize);
    },
    [setPage, setLimit],
  );

  const handleSortingChange = React.useCallback(
    (newSorting: { id: string; desc: boolean }[]): void => {
      setSortBy(newSorting);
    },
    [setSortBy],
  );

  const handleSearchChange = React.useCallback(
    (newSearch: string): void => {
      setSearch(newSearch);
    },
    [setSearch],
  );

  // Optimized status change handler with translated messages
  const handleStatusChange = React.useCallback(
    async (id: string, status: string): Promise<void> => {
      try {
        const result = await updateClaimStatus(id, status);

        if (result.success) {
          toast({
            title: t('statusUpdated'),
            description: t('statusUpdatedMessage', { status }),
          });
          refresh();
          onRefresh?.();
          onStatusChange?.(id, status);
        } else {
          toast({
            title: tCommon('error'),
            description: result.error || t('statusUpdateFailed'),
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error updating claim status:', error);
        toast({
          title: tCommon('error'),
          description: tCommon('unexpected'),
          variant: 'destructive',
        });
      }
    },
    [refresh, onRefresh, onStatusChange, t, tCommon],
  );

  // Memoized status badge component with translations
  const getStatusBadge = React.useCallback(
    (status: string): React.ReactElement => {
      const statusConfig = {
        [CLAIM_STATUSES.CLAIMED]: {
          variant: 'secondary' as const,
          className: '',
          label: t('status.claimed'),
        },
        [CLAIM_STATUSES.FULFILLED]: {
          variant: 'secondary' as const,
          className: 'bg-green-500 hover:bg-green-600 text-white',
          label: t('status.completed'),
        },
        [CLAIM_STATUSES.CANCELLED]: {
          variant: 'destructive' as const,
          className: '',
          label: t('status.cancelled'),
        },
        [CLAIM_STATUSES.PENDING]: {
          variant: 'outline' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: t('status.pending'),
        },
      };

      const config = statusConfig[status as keyof typeof statusConfig] || {
        variant: 'outline' as const,
        className: '',
        label: status,
      };

      return (
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
      );
    },
    [t],
  );

  // Memoized columns with translations
  const columns = React.useMemo(
    (): ColumnDef<RewardClaimWithRelations>[] => [
      {
        accessorKey: 'claimDate',
        header: t('columns.claimDate'),
        cell: ({ row }) => (
          <div className="font-medium">
            {format(new Date(row.getValue('claimDate')), 'PPp')}
          </div>
        ),
        enableSorting: true,
      },
      {
        id: 'member',
        header: t('columns.member'),
        cell: ({ row }) => {
          const member = row.original.member;
          return <div className="font-medium">{member.name}</div>;
        },
      },
      {
        id: 'reward',
        header: t('columns.reward'),
        cell: ({ row }) => {
          const reward = row.original.reward;
          return (
            <div className="font-medium">
              {reward.name}
              <span className="block text-xs text-muted-foreground">
                {reward.pointsCost} {tCommon('points')}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: t('columns.status'),
        cell: ({ row }) => getStatusBadge(row.getValue('status')),
        enableSorting: true,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const claim = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{t('openMenu')}</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs">
                    {t('changeStatus')}
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={claim.status}>
                    <DropdownMenuRadioItem
                      value={CLAIM_STATUSES.CLAIMED}
                      onClick={() =>
                        handleStatusChange(claim.id, CLAIM_STATUSES.CLAIMED)
                      }
                    >
                      {t('status.claimed')}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value={CLAIM_STATUSES.FULFILLED}
                      onClick={() =>
                        handleStatusChange(claim.id, CLAIM_STATUSES.FULFILLED)
                      }
                    >
                      {t('status.completed')}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value={CLAIM_STATUSES.CANCELLED}
                      onClick={() =>
                        handleStatusChange(claim.id, CLAIM_STATUSES.CANCELLED)
                      }
                    >
                      {t('status.cancelled')}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value={CLAIM_STATUSES.PENDING}
                      onClick={() =>
                        handleStatusChange(claim.id, CLAIM_STATUSES.PENDING)
                      }
                    >
                      {t('status.pending')}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [getStatusBadge, handleStatusChange, t, tCommon],
  );

  return (
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
  );
}
