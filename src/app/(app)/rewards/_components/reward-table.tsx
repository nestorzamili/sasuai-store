'use client';
import * as React from 'react';
import { useState } from 'react';
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
  // State for image preview dialog
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Use the useFetch hook to handle data fetching, pagination, and sorting
  const fetchRewards = async (options: FetchOptions) => {
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
  } = useFetch<RewardWithClaimCount[]>({
    fetchData: fetchRewards,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'name',
    initialSortDirection: false,
  });

  // Handle pagination change
  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setPage(newPagination.pageIndex);
    setLimit(newPagination.pageSize);
  };

  // Handle sorting change
  const handleSortingChange = (newSorting: SortingState[]) => {
    setSortBy(newSorting.length > 0 ? [newSorting[0]] : []);
  };

  // Handle search change
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
  };

  // Define columns
  const columns: ColumnDef<RewardWithClaimCount>[] = [
    // Image column
    {
      id: 'image',
      header: 'Image',
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
      header: 'Reward Name',
      cell: ({ row }) => (
        <div className="flex items-center">
          <IconTrophy className="mr-2 h-4 w-4 text-yellow-500" />
          <div className="font-medium">{row.getValue('name')}</div>
        </div>
      ),
      enableSorting: true,
    },

    // Points cost column
    {
      accessorKey: 'pointsCost',
      header: 'Points Cost',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('pointsCost')} points</div>
      ),
      enableSorting: true,
    },

    // Stock column
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => {
        const stock = row.getValue('stock') as number;
        return (
          <div className="font-medium">
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
      enableSorting: true,
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
      enableSorting: true,
    },

    // Expiry date column
    {
      accessorKey: 'expiryDate',
      header: 'Expiry',
      cell: ({ row }) => {
        const expiryDate = row.original.expiryDate;
        if (!expiryDate)
          return (
            <span className="text-muted-foreground text-sm">No expiry</span>
          );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiryDateOnly = new Date(expiryDate);
        expiryDateOnly.setHours(0, 0, 0, 0);

        const isExpired = expiryDateOnly < today;

        if (isExpired) {
          return (
            <Badge variant="destructive" className="whitespace-nowrap text-xs">
              Expired
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
      header: '',
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
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer"
                  onClick={() => onEdit?.(reward)}
                >
                  Edit <IconEdit className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => onDelete(reward)}
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
