'use client';

import * as React from 'react';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconTrash, IconEdit, IconEye, IconPower } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableLayout } from '@/components/layout/table-layout';
import { useFetch } from '@/hooks/use-fetch';
import { getAllDiscounts, toggleDiscountStatus } from '../action';
import { format } from 'date-fns';
import { DiscountDeleteDialog } from './discount-delete-dialog';
import { DiscountDetailDialog } from './discount-detail-dialog';
import { toast } from '@/hooks/use-toast';
import { DiscountApplyTo, DiscountType } from '@/lib/types/discount';
import {
  formatDiscountValue,
  formatApplyTo,
} from '@/lib/common/discount-utils';
import { useRouter } from 'next/navigation';

interface DiscountTableProps {
  onRefresh?: () => void;
}

export function DiscountTable({ onRefresh }: DiscountTableProps) {
  const router = useRouter();

  const fetchDiscounts = async (options: any) => {
    const response = await getAllDiscounts({
      page: options.page + 1,
      pageSize: options.limit,
      sortField: options.sortBy?.id || 'createdAt',
      sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
      search: options.search,
      isActive: options.filters?.isActive,
      type: options.filters?.type as DiscountType,
      applyTo: options.filters?.applyTo as DiscountApplyTo,
      isGlobal: options.filters?.isGlobal,
    });

    if (response.success && response.discounts && response.pagination) {
      return {
        data: response.discounts,
        totalRows: response.pagination.totalCount,
      };
    }

    return {
      data: [],
      totalRows: 0,
    };
  };

  const {
    data: discounts,
    isLoading,
    options,
    setPage,
    setLimit,
    setSortBy,
    setSearch,
    setFilters,
    totalRows,
    refresh,
  } = useFetch<any[]>({
    fetchData: fetchDiscounts,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'createdAt',
    initialSortDirection: true, // desc
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

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
  };

  const handleFilterChange = (key: string, value: any) => {
    // For the status filter
    if (key === 'isActive') {
      const actualValue =
        value === 'ALL_STATUSES'
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

    // For type and applyTo filters
    if (value === 'ALL_TYPES' || value === 'ALL_APPLICATIONS') {
      setFilters((prev: any) => {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      });
      return;
    }

    // Normal case
    setFilters((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteData, setDeleteData] = useState<any | null>(null);

  // Handle toggle discount status
  const handleToggleStatus = async (discount: any) => {
    try {
      const result = await toggleDiscountStatus(discount.id);
      if (result.success) {
        toast({
          title: 'Status Updated',
          description: result.message,
        });
        refresh();
        onRefresh?.();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update status',
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

  // Handle successful operations
  const handleOperationSuccess = () => {
    refresh();
    onRefresh?.();
  };

  const handleEdit = (discount: any) => {
    router.push(`/discounts/${discount.id}/edit`);
  };

  const columns: ColumnDef<any>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
      enableSorting: true,
    },
    {
      header: 'Code',
      accessorKey: 'code',
      cell: ({ row }) => {
        const code = row.getValue('code') as string;
        return code ? (
          <Badge variant="outline" className="font-mono">
            {code}
          </Badge>
        ) : (
          <span className="text-muted-foreground italic">No code</span>
        );
      },
    },
    {
      header: 'Type & Value',
      accessorKey: 'type',
      cell: ({ row }) => {
        const type = row.getValue('type') as DiscountType;
        const value = row.original.value as number;
        return (
          <Badge variant={type === 'PERCENTAGE' ? 'default' : 'secondary'}>
            {formatDiscountValue(type, value)}
          </Badge>
        );
      },
    },
    {
      header: 'Date Range',
      accessorKey: 'startDate',
      cell: ({ row }) => {
        const startDate = new Date(row.getValue('startDate'));
        const endDate = new Date(row.original.endDate);
        return (
          <div className="text-md">
            <div>
              {format(startDate, 'MMM d, yyyy')} -{' '}
              {format(endDate, 'MMM d, yyyy')}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Applies To',
      accessorKey: 'applyTo',
      cell: ({ row }) => {
        const applyTo = row.getValue('applyTo') as DiscountApplyTo;
        const relationCounts = row.original.relationCounts || {};

        return (
          <div>
            <div>{formatApplyTo(applyTo)}</div>
            {applyTo === 'SPECIFIC_PRODUCTS' && relationCounts.products > 0 && (
              <div className="text-xs text-muted-foreground">
                {relationCounts.products} products
              </div>
            )}
            {applyTo === 'SPECIFIC_MEMBERS' && relationCounts.members > 0 && (
              <div className="text-xs text-muted-foreground">
                {relationCounts.members} members
              </div>
            )}
            {applyTo === 'SPECIFIC_MEMBER_TIERS' &&
              relationCounts.memberTiers > 0 && (
                <div className="text-xs text-muted-foreground">
                  {relationCounts.memberTiers} tiers
                </div>
              )}
          </div>
        );
      },
    },
    {
      header: 'Usage',
      accessorKey: 'usedCount',
      cell: ({ row }) => {
        const usage = row.original.usage;
        return (
          <div>
            <div>
              {usage.usedCount} / {usage.maxUses || '∞'}
            </div>
            {usage.maxUses && usage.usagePercentage !== null && (
              <div className="text-xs text-muted-foreground">
                {usage.usagePercentage}% used
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        const isValid = row.original.isValid as boolean;

        return isActive && isValid ? (
          <Badge variant="default">
            <span>Active</span>
          </Badge>
        ) : isActive && !isValid ? (
          <Badge variant="secondary">
            <span>Inactive</span>
          </Badge>
        ) : (
          <Badge variant="outline">
            <span>Disabled</span>
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const discount = row.original;
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
                  onClick={() => {
                    setDetailId(discount.id);
                    setDetailDialog(true);
                  }}
                >
                  View Details <IconEye className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer"
                  onClick={() => handleEdit(discount)}
                >
                  Edit <IconEdit className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer"
                  onClick={() => handleToggleStatus(discount)}
                >
                  {discount.isActive ? 'Disable' : 'Enable'}{' '}
                  <IconPower className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => {
                    setDeleteData(discount);
                    setDeleteDialog(true);
                  }}
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

  // Filter options for the discount type dropdown
  const discountTypeOptions = [
    { value: 'ALL_TYPES', label: 'All Types' },
    { value: 'PERCENTAGE', label: 'Percentage' },
    { value: 'FIXED_AMOUNT', label: 'Fixed Amount' },
  ];

  // Filter options for apply to dropdown
  const applyToOptions = [
    { value: 'ALL_APPLICATIONS', label: 'All Applications' },
    { value: 'SPECIFIC_PRODUCTS', label: 'Specific Products' },
    { value: 'SPECIFIC_MEMBERS', label: 'Specific Members' },
    { value: 'SPECIFIC_MEMBER_TIERS', label: 'Member Tiers' },
  ];

  // Filter options for active status
  const statusOptions = [
    { value: 'ALL_STATUSES', label: 'All Statuses' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  return (
    <>
      <TableLayout
        data={discounts || []}
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
            id: 'type',
            label: 'Type',
            type: 'select',
            options: discountTypeOptions,
            handleFilterChange: (value) => handleFilterChange('type', value),
          },
          {
            id: 'applyTo',
            label: 'Applies To',
            type: 'select',
            options: applyToOptions,
            handleFilterChange: (value) => handleFilterChange('applyTo', value),
          },
          {
            id: 'isActive',
            label: 'Status',
            type: 'select',
            options: statusOptions,
            handleFilterChange: (value) =>
              handleFilterChange(
                'isActive',
                value === 'true' ? true : value === 'false' ? false : undefined,
              ),
          },
        ]}
      />
      {deleteDialog && deleteData && (
        <DiscountDeleteDialog
          open={deleteDialog}
          onOpenChange={setDeleteDialog}
          discount={deleteData}
          onSuccess={handleOperationSuccess}
        />
      )}
      {detailDialog && detailId && (
        <DiscountDetailDialog
          open={detailDialog}
          onOpenChange={setDetailDialog}
          discountId={detailId}
        />
      )}
    </>
  );
}
