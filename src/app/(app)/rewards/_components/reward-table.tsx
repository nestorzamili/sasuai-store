'use client';
import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  IconTrash,
  IconEdit,
  IconTrophy,
  IconPhoto,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  RewardWithClaimCount,
  FetchOptions,
  SortingState,
  RewardTableProps,
} from '@/lib/types/reward';
import { format } from 'date-fns';
import Image from 'next/image';
import { useFetch } from '@/hooks/use-fetch';
import { getAllRewardsWithClaimCount } from '../actions';
import { TableLayout } from '@/components/layout/table-layout';
import { ImagePreviewDialog } from '@/components/image-preview-dialog';

export function RewardTable({ onEdit, onDelete }: RewardTableProps) {
  const t = useTranslations('reward.table');

  // State for image preview dialog
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Use the useFetch hook to handle data fetching, pagination, and sorting
  const fetchRewards = useCallback(async (options: FetchOptions) => {
    const response = await getAllRewardsWithClaimCount({
      page: (options.page ?? 0) + 1,
      limit: options.limit ?? 10,
      sortBy: options.sortBy?.id || 'name',
      sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
      query: options.search,
      includeInactive: true,
    });

    if (response.success && response.data) {
      return {
        data: response.data.rewards || [],
        totalRows: response.data.totalCount || 0,
      };
    }

    return { data: [], totalRows: 0 };
  }, []);

  const {
    data,
    isLoading,
    options,
    setPage,
    setLimit,
    setSortBy,
    setSearch,
    totalRows,
  } = useFetch<RewardWithClaimCount[]>({
    fetchData: fetchRewards,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'name',
    initialSortDirection: false,
  });

  // Handle pagination change - stabilize with useCallback
  const handlePaginationChange = useCallback(
    (newPagination: { pageIndex: number; pageSize: number }) => {
      setPage(newPagination.pageIndex);
      setLimit(newPagination.pageSize);
    },
    [setPage, setLimit],
  );

  // Handle sorting change - stabilize with useCallback
  const handleSortingChange = useCallback(
    (newSorting: SortingState[]) => {
      setSortBy(newSorting.length > 0 ? [newSorting[0]] : []);
    },
    [setSortBy],
  );

  // Handle search change - stabilize with useCallback
  const handleSearchChange = useCallback(
    (newSearch: string) => {
      setSearch(newSearch);
    },
    [setSearch],
  );

  // Define columns - memoize to prevent re-creation with translations
  const columns: ColumnDef<RewardWithClaimCount>[] = useMemo(
    () => [
      // Image column
      {
        id: 'image',
        header: t('columns.image'),
        cell: ({ row }) => {
          const reward = row.original;
          if (reward.imageUrl) {
            return (
              <div
                className="relative h-12 w-16 rounded overflow-hidden cursor-pointer"
                onClick={() => setSelectedImage(reward.imageUrl || null)}
              >
                <Image
                  src={reward.imageUrl}
                  alt={reward.name}
                  fill
                  className="object-cover hover:opacity-80 transition-opacity"
                  sizes="64px"
                />
              </div>
            );
          }
          return (
            <div className="h-12 w-16 rounded bg-muted flex items-center justify-center">
              <IconPhoto className="h-5 w-5 text-muted-foreground/60" />
            </div>
          );
        },
      },

      // Name column
      {
        accessorKey: 'name',
        header: t('columns.name'),
        cell: ({ row }) => (
          <div className="flex items-center">
            <IconTrophy className="mr-2 h-4 w-4 text-yellow-500" />
            <div className="font-medium">{row.getValue('name')}</div>
          </div>
        ),
        enableSorting: false,
      },

      // Points cost column
      {
        accessorKey: 'pointsCost',
        header: t('columns.pointsCost'),
        cell: ({ row }) => (
          <div className="font-medium">
            {row.getValue('pointsCost')} {t('pointsLabel')}
          </div>
        ),
        enableSorting: true,
      },

      // Stock column
      {
        accessorKey: 'stock',
        header: t('columns.stock'),
        cell: ({ row }) => {
          const stock = row.getValue('stock') as number;
          return (
            <div className="font-medium">
              {stock === 0 ? (
                <Badge variant="destructive">{t('stock.outOfStock')}</Badge>
              ) : stock < 10 ? (
                <Badge
                  variant="secondary"
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {t('stock.remaining', { count: stock })}
                </Badge>
              ) : (
                <Badge variant="outline">{stock}</Badge>
              )}
            </div>
          );
        },
        enableSorting: true,
      },

      // Active status column
      {
        accessorKey: 'isActive',
        header: t('columns.status'),
        cell: ({ row }) => {
          const isActive = row.getValue('isActive') as boolean;
          return (
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className={isActive ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              {isActive ? t('status.active') : t('status.inactive')}
            </Badge>
          );
        },
        enableSorting: true,
      },

      // Expiry date column
      {
        accessorKey: 'expiryDate',
        header: t('columns.expiryDate'),
        cell: ({ row }) => {
          const expiryDate = row.original.expiryDate;
          if (!expiryDate)
            return (
              <span className="text-muted-foreground text-sm">
                {t('expiry.noExpiry')}
              </span>
            );

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const expiryDateOnly = new Date(expiryDate);
          expiryDateOnly.setHours(0, 0, 0, 0);

          const isExpired = expiryDateOnly < today;

          if (isExpired) {
            return (
              <Badge
                variant="destructive"
                className="whitespace-nowrap text-xs"
              >
                {t('status.expired')}
              </Badge>
            );
          }

          return (
            <span className="text-sm">
              {format(new Date(expiryDate), 'MMM d, yyyy')}
            </span>
          );
        },
      },

      // Claims count column
      {
        id: 'claimsCount',
        header: t('columns.claims'),
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {t('claims.count', {
              count: row.original._count?.rewardClaims || 0,
            })}
          </Badge>
        ),
      },

      // Actions column
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const reward = row.original;
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
                    onClick={() => onEdit?.(reward)}
                  >
                    {t('actions.edit')} <IconEdit className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => onDelete(reward)}
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
    [t, onEdit, onDelete],
  );

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

      {/* Image preview dialog */}
      <ImagePreviewDialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
        imageUrl={selectedImage}
        altText="Reward image"
      />
    </>
  );
}
