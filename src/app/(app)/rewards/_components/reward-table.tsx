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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RewardWithClaimCount } from '@/lib/types/reward';
import { CountdownTimer } from '@/components/countdown-timer';
import { format } from 'date-fns';
import Image from 'next/image';
import { useFetch } from '@/hooks/use-fetch';
import { getAllRewardsWithClaimCount } from '../actions';
import { TableLayout } from '@/components/layout/table-layout';
import { ImagePreviewDialog } from '@/components/image-preview-dialog';

interface RewardTableProps {
  data?: RewardWithClaimCount[];
  isLoading?: boolean;
  onEdit?: (reward: RewardWithClaimCount) => void;
  onDelete: (reward: RewardWithClaimCount) => void;
  onRefresh?: () => void;
}

export function RewardTable({ onEdit, onDelete, onRefresh }: RewardTableProps) {
  // State for image preview dialog
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Use the useFetch hook to handle data fetching, pagination, and sorting
  const fetchRewards = async (options: any) => {
    const response = await getAllRewardsWithClaimCount();

    if (response.success && response.data) {
      const rewards = response.data as RewardWithClaimCount[];

      // Apply filtering if search term is provided
      let filteredData = rewards;
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        filteredData = rewards.filter(
          (reward) =>
            reward.name.toLowerCase().includes(searchLower) ||
            (reward.description &&
              reward.description.toLowerCase().includes(searchLower)),
        );
      }

      // Apply sorting if needed
      if (options.sortBy?.id) {
        const { id, desc } = options.sortBy;
        filteredData.sort((a: any, b: any) => {
          // Handle null values to avoid comparison errors
          if (a[id] === null) return desc ? -1 : 1;
          if (b[id] === null) return desc ? 1 : -1;

          // For strings, use localeCompare
          if (typeof a[id] === 'string') {
            return desc
              ? b[id].localeCompare(a[id])
              : a[id].localeCompare(b[id]);
          }

          // For numbers and other types
          if (a[id] < b[id]) return desc ? 1 : -1;
          if (a[id] > b[id]) return desc ? -1 : 1;
          return 0;
        });
      }

      // Apply pagination
      const start = options.page * options.limit;
      const end = start + options.limit;
      const paginatedData = filteredData.slice(start, end);

      return {
        data: paginatedData,
        totalRows: filteredData.length,
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
    refresh,
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
  const handleSortingChange = (newSorting: any) => {
    setSortBy(newSorting);
  };

  // Handle search change
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
  };

  // Handle successful operations
  const handleOperationSuccess = () => {
    refresh();
    onRefresh?.();
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
              onClick={() => setSelectedImage(reward.imageUrl)}
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
      maxSize: 180, // Limit the maximum width
      cell: ({ row }) => {
        const expiryDate = row.original.expiryDate;
        if (!expiryDate)
          return (
            <span className="text-muted-foreground text-sm">No expiry</span>
          );

        const isExpired = new Date(expiryDate) < new Date();

        if (isExpired) {
          return (
            <Badge variant="destructive" className="whitespace-nowrap text-xs">
              Expired
            </Badge>
          );
        }

        // Use CountdownTimer for active rewards with more compact display
        return (
          <div className="flex flex-col gap-1">
            <CountdownTimer expiryDate={new Date(expiryDate)} />
            <span
              className="text-xs text-muted-foreground truncate max-w-[150px]"
              title={format(new Date(expiryDate), "MMM d, yyyy 'at' h:mm a")}
            >
              {format(new Date(expiryDate), 'MMM d, yyyy')}
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
