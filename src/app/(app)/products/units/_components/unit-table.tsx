'use client';
import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  UnitWithCounts,
  UnitFetchOptions,
  UnitFetchResult,
} from '@/lib/types/unit';
import { TableLayout } from '@/components/layout/table-layout';
import { UnitDeleteDialog } from './unit-delete-dialog';
import { useFetch } from '@/hooks/use-fetch';
import { getAllUnitsWithCounts } from '../action';

interface UnitTableProps {
  onEdit?: (unit: UnitWithCounts) => void;
  onRefresh?: () => void;
}

export function UnitTable({ onEdit, onRefresh }: UnitTableProps) {
  const t = useTranslations('unit.table');

  // State for delete dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteData, setDeleteData] = useState<UnitWithCounts | null>(null);

  // Memoized fetch function
  const fetchUnits = useCallback(
    async (
      options: UnitFetchOptions,
    ): Promise<UnitFetchResult<UnitWithCounts[]>> => {
      const response = await getAllUnitsWithCounts({
        page: (options.page ?? 0) + 1, // Convert 0-based to 1-based indexing
        limit: options.limit ?? 10,
        sortBy: options.sortBy?.id ?? 'name',
        sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
        query: options.search ?? '',
        columnFilter: options.columnFilter ?? ['name', 'symbol'],
      });

      return {
        data: response.data || [],
        totalRows: response.totalRows || 0,
      };
    },
    [],
  );

  // Use fetch hook with proper typing
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
  } = useFetch<UnitWithCounts[]>({
    fetchData: fetchUnits,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'name',
    initialSortDirection: false,
  });

  // Memoized handlers - stabilize with useCallback
  const handlePaginationChange = useCallback(
    (newPagination: { pageIndex: number; pageSize: number }): void => {
      setPage(newPagination.pageIndex);
      setLimit(newPagination.pageSize);
    },
    [setPage, setLimit],
  );

  const handleSortingChange = useCallback(
    (newSorting: { id: string; desc: boolean }[]): void => {
      setSortBy(newSorting);
    },
    [setSortBy],
  );

  const handleSearchChange = useCallback(
    (newSearch: string): void => {
      setSearch(newSearch);
    },
    [setSearch],
  );

  // Handle successful operations - stabilize with useCallback
  const handleOperationSuccess = useCallback((): void => {
    refresh();
    onRefresh?.();
  }, [refresh, onRefresh]);

  // Handle delete action - stabilize with useCallback
  const handleDeleteClick = useCallback((unit: UnitWithCounts): void => {
    setDeleteData(unit);
    setDeleteDialog(true);
  }, []);

  // Handle edit action - stabilize with useCallback
  const handleEditClick = useCallback(
    (unit: UnitWithCounts): void => {
      onEdit?.(unit);
    },
    [onEdit],
  );

  // Calculate if a unit is in use - stabilize with useCallback
  const isUnitInUse = useCallback((unit: UnitWithCounts): boolean => {
    return !!(
      (unit._count?.products && unit._count.products > 0) ||
      (unit._count?.stockIns && unit._count.stockIns > 0) ||
      (unit._count?.stockOuts && unit._count.stockOuts > 0) ||
      (unit._count?.transactionItems && unit._count.transactionItems > 0)
    );
  }, []);

  // Memoized columns
  const columns = useMemo(
    (): ColumnDef<UnitWithCounts>[] => [
      {
        header: t('columns.name'),
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        ),
        enableSorting: false,
      },
      {
        header: t('columns.symbol'),
        accessorKey: 'symbol',
        cell: ({ row }) => (
          <div className="font-mono">{row.getValue('symbol')}</div>
        ),
        enableSorting: false,
      },
      {
        header: t('columns.usage'),
        id: 'usage',
        cell: ({ row }) => {
          const unit = row.original;
          const counts = unit._count || {};
          const products = counts.products || 0;
          const stockIns = counts.stockIns || 0;
          const stockOuts = counts.stockOuts || 0;
          const transactions = counts.transactionItems || 0;

          return (
            <div className="flex flex-wrap gap-1">
              {products > 0 && (
                <Badge variant="outline" className="text-xs">
                  {products} {t('badges.products')}
                </Badge>
              )}
              {stockIns > 0 && (
                <Badge variant="outline" className="text-xs">
                  {stockIns} {t('badges.stockIns')}
                </Badge>
              )}
              {stockOuts > 0 && (
                <Badge variant="outline" className="text-xs">
                  {stockOuts} {t('badges.stockOuts')}
                </Badge>
              )}
              {transactions > 0 && (
                <Badge variant="outline" className="text-xs">
                  {transactions} {t('badges.transactions')}
                </Badge>
              )}
              {products === 0 &&
                stockIns === 0 &&
                stockOuts === 0 &&
                transactions === 0 && (
                  <span className="text-muted-foreground italic text-xs">
                    {t('badges.notInUse')}
                  </span>
                )}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        header: t('columns.conversions'),
        id: 'conversions',
        cell: ({ row }) => {
          const unit = row.original;
          const counts = unit._count || {};
          const fromConversions = counts.fromUnitConversions || 0;
          const toConversions = counts.toUnitConversions || 0;
          const totalConversions = fromConversions + toConversions;

          return (
            <Badge variant="outline" className="text-xs">
              {totalConversions} {t('badges.conversions')}
            </Badge>
          );
        },
        enableSorting: false,
      },
      {
        header: t('columns.created'),
        accessorKey: 'createdAt',
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'));
          return (
            <div className="text-sm text-muted-foreground">
              {date.toLocaleDateString()}
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const unit = row.original;
          const inUse = isUnitInUse(unit);

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
                  <DropdownMenuLabel>{t('actions.actions')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => handleEditClick(unit)}
                  >
                    {t('actions.edit')} <IconEdit className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(unit)}
                    disabled={inUse}
                  >
                    {t('actions.delete')} <IconTrash className="h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [handleEditClick, handleDeleteClick, isUnitInUse, t],
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
      {deleteDialog && deleteData && (
        <UnitDeleteDialog
          open={deleteDialog}
          onOpenChange={setDeleteDialog}
          unit={deleteData}
          onSuccess={handleOperationSuccess}
        />
      )}
    </>
  );
}
