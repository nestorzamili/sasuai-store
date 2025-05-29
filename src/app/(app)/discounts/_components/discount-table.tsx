'use client';

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
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
import { useRouter } from 'next/navigation';
import {
  DiscountApplyTo,
  DiscountType,
  DiscountWithCounts,
  DiscountTableProps,
  DiscountFetchOptions,
} from '@/lib/types/discount';
import { TableFetchOptions, TableFetchResult } from '@/lib/types/inventory';
import {
  formatDiscountValue,
  formatApplyTo,
} from '@/lib/common/discount-utils';
import type {
  DiscountType as PrismaDiscountType,
  DiscountApplyTo as PrismaDiscountApplyTo,
} from '@prisma/client';

interface FetchOptions extends TableFetchOptions {
  filters?: DiscountFetchOptions['filters'];
}

type FetchResult = TableFetchResult<DiscountWithCounts[]>;

export function DiscountTable({ onRefresh }: DiscountTableProps) {
  const router = useRouter();

  // Memoize the fetchDiscounts function to prevent unnecessary re-renders
  const fetchDiscounts = useCallback(
    async (options: FetchOptions): Promise<FetchResult> => {
      try {
        const response = await getAllDiscounts({
          page: (options.page ?? 0) + 1,
          pageSize: options.limit ?? 10,
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
      } catch (error) {
        console.error('Error fetching discounts:', error);
        return {
          data: [],
          totalRows: 0,
        };
      }
    },
    [], // Empty dependency array since getAllDiscounts is stable
  );

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
  } = useFetch<DiscountWithCounts[]>({
    fetchData: fetchDiscounts,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'createdAt',
    initialSortDirection: true, // desc
  });

  // Memoize handlers to prevent unnecessary re-renders
  const handlePaginationChange = useCallback(
    (newPagination: { pageIndex: number; pageSize: number }) => {
      setPage(newPagination.pageIndex);
      setLimit(newPagination.pageSize);
    },
    [setPage, setLimit],
  );

  const handleSortingChange = useCallback(
    (newSorting: { id: string; desc: boolean }[]) => {
      setSortBy(newSorting);
    },
    [setSortBy],
  );

  const handleSearchChange = useCallback(
    (newSearch: string) => {
      setSearch(newSearch);
    },
    [setSearch],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string | boolean | undefined) => {
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

        setFilters((prev: FetchOptions['filters']) => ({
          ...prev,
          [key]: actualValue,
        }));
        return;
      }

      // For type and applyTo filters
      if (value === 'ALL_TYPES' || value === 'ALL_APPLICATIONS') {
        setFilters((prev: FetchOptions['filters']) => {
          if (!prev) return {};
          const newFilters = { ...prev };
          if (key === 'type') {
            delete newFilters.type;
          } else if (key === 'applyTo') {
            delete newFilters.applyTo;
          } else if (key === 'isGlobal') {
            delete newFilters.isGlobal;
          }
          return newFilters;
        });
        return;
      }

      // Normal case
      setFilters((prev: FetchOptions['filters']) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setFilters],
  );

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteData, setDeleteData] = useState<DiscountWithCounts | null>(null);

  // Handle toggle discount status with useCallback
  const handleToggleStatus = useCallback(
    async (discount: DiscountWithCounts) => {
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
        console.error('Error toggling discount status:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
    },
    [refresh, onRefresh],
  );

  // Handle successful operations with useCallback
  const handleOperationSuccess = useCallback(() => {
    refresh();
    onRefresh?.();
  }, [refresh, onRefresh]);

  const handleEdit = useCallback(
    (discount: DiscountWithCounts) => {
      router.push(`/discounts/${discount.id}/edit`);
    },
    [router],
  );

  // Memoize filter options to prevent unnecessary re-renders
  const filterOptions = useMemo(
    () => ({
      discountTypeOptions: [
        { value: 'ALL_TYPES', label: 'All Types' },
        { value: 'PERCENTAGE', label: 'Percentage' },
        { value: 'FIXED_AMOUNT', label: 'Fixed Amount' },
      ],
      applyToOptions: [
        { value: 'ALL_APPLICATIONS', label: 'All Applications' },
        { value: 'SPECIFIC_PRODUCTS', label: 'Specific Products' },
        { value: 'SPECIFIC_MEMBERS', label: 'Specific Members' },
        { value: 'SPECIFIC_MEMBER_TIERS', label: 'Member Tiers' },
      ],
      statusOptions: [
        { value: 'ALL_STATUSES', label: 'All Statuses' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    }),
    [],
  );

  const columns: ColumnDef<DiscountWithCounts>[] = [
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
        const code = row.getValue('code') as string | null;
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
        const type = row.getValue('type') as PrismaDiscountType;
        const value = row.original.value as number;
        return (
          <Badge variant={type === 'PERCENTAGE' ? 'default' : 'secondary'}>
            {formatDiscountValue(type as DiscountType, value)}
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
        const applyTo = row.getValue('applyTo') as PrismaDiscountApplyTo | null;
        const relationCounts = row.original.relationCounts;

        return (
          <div>
            <div>{formatApplyTo(applyTo as DiscountApplyTo)}</div>
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
            options: filterOptions.discountTypeOptions,
            handleFilterChange: (value: string) =>
              handleFilterChange('type', value),
          },
          {
            id: 'applyTo',
            label: 'Applies To',
            type: 'select',
            options: filterOptions.applyToOptions,
            handleFilterChange: (value: string) =>
              handleFilterChange('applyTo', value),
          },
          {
            id: 'isActive',
            label: 'Status',
            type: 'select',
            options: filterOptions.statusOptions,
            handleFilterChange: (value: string) =>
              handleFilterChange('isActive', value),
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
