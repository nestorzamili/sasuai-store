'use client';
import * as React from 'react';
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

export function RewardClaimsTable({
  onStatusChange,
  onRefresh,
}: RewardClaimsTableProps) {
  // Fetch claims data
  const fetchClaims = async (options: any) => {
    const result = await getAllRewardClaims({
      page: options.page + 1, // API uses 1-based indexing
      limit: options.limit,
      search: options.search,
      status: options.status !== 'all' ? options.status : '',
      sortBy: options.sortBy?.id || 'claimDate',
      sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
    });

    if (result.success && result.data) {
      return {
        data: result.data.claims || [],
        totalRows: result.data.totalCount || 0,
      };
    }

    return { data: [], totalRows: 0 };
  };

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
    initialSortDirection: true, // desc by default for claims
    options: {
      status: 'all',
    },
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

  // Handle claim status update
  const handleStatusChange = async (id: string, status: string) => {
    try {
      const result = await updateClaimStatus(id, status);

      if (result.success) {
        toast({
          title: 'Status updated',
          description: `Claim status has been updated to ${status}`,
        });
        refresh();
        if (onRefresh) onRefresh();
        if (onStatusChange) onStatusChange(id, status);
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
      accessorKey: 'claimDate',
      header: 'Claim Date',
      cell: ({ row }) => (
        <div className="font-medium">
          {format(new Date(row.getValue('claimDate')), 'PPp')}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: 'member',
      header: 'Member',
      cell: ({ row }) => {
        const member = row.original.member;
        return <div className="font-medium">{member.name}</div>;
      },
    },
    {
      id: 'reward',
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
