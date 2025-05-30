'use client';
import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  UnitConversionWithUnits,
  UnitWithCounts,
  UnitConversionFetchOptions,
  UnitFetchResult,
} from '@/lib/types/unit';
import { TableLayout } from '@/components/layout/table-layout';
import { UnitConversionDeleteDialog } from './unit-conversion-delete-dialog';
import { useFetch } from '@/hooks/use-fetch';
import { getAllConversionsWithOptions } from '../conversion-actions';

interface UnitConversionTableProps {
  units: UnitWithCounts[];
  isLoading?: boolean;
  onEdit?: (conversion: UnitConversionWithUnits) => void;
  onRefresh?: () => void;
}

export function UnitConversionTable({
  isLoading: initialLoading = false,
  onEdit,
  onRefresh,
}: UnitConversionTableProps) {
  const t = useTranslations('unit.conversionTable');

  // State for delete dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteData, setDeleteData] = useState<UnitConversionWithUnits | null>(
    null,
  );

  // Memoized fetch function
  const fetchConversions = useCallback(
    async (
      options: UnitConversionFetchOptions,
    ): Promise<UnitFetchResult<UnitConversionWithUnits[]>> => {
      const response = await getAllConversionsWithOptions({
        page: (options.page ?? 0) + 1, // Convert 0-based to 1-based indexing
        limit: options.limit ?? 10,
        sortBy: options.sortBy?.id ?? 'fromUnit',
        sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
        query: options.search ?? '',
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
  } = useFetch<UnitConversionWithUnits[]>({
    fetchData: fetchConversions,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'fromUnit',
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
  const handleDeleteClick = useCallback(
    (conversion: UnitConversionWithUnits): void => {
      setDeleteData(conversion);
      setDeleteDialog(true);
    },
    [],
  );

  // Handle edit action - stabilize with useCallback
  const handleEditClick = useCallback(
    (conversion: UnitConversionWithUnits): void => {
      onEdit?.(conversion);
    },
    [onEdit],
  );

  // Memoized columns
  const columns = useMemo(
    (): ColumnDef<UnitConversionWithUnits>[] => [
      {
        accessorKey: 'fromUnit',
        header: t('columns.fromUnit'),
        cell: ({ row }) => {
          const fromUnit = row.original.fromUnit;
          return (
            <div className="font-medium">
              {fromUnit.name} ({fromUnit.symbol})
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: 'toUnit',
        header: t('columns.toUnit'),
        cell: ({ row }) => {
          const toUnit = row.original.toUnit;
          return (
            <div className="font-medium">
              {toUnit.name} ({toUnit.symbol})
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: 'conversionFactor',
        header: t('columns.factor'),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.conversionFactor}</div>
        ),
        enableSorting: false,
      },
      {
        id: 'explanation',
        header: t('columns.explanation'),
        cell: ({ row }) => {
          const conversion = row.original;
          return (
            <div className="text-sm">
              {t('explanationText', {
                fromUnit: conversion.fromUnit.name,
                fromSymbol: conversion.fromUnit.symbol,
                factor: conversion.conversionFactor,
                toUnit: conversion.toUnit.name,
                toSymbol: conversion.toUnit.symbol,
              })}
            </div>
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
          const conversion = row.original;
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
                    onClick={() => handleEditClick(conversion)}
                  >
                    {t('actions.edit')} <IconEdit className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(conversion)}
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
    [handleEditClick, handleDeleteClick, t],
  );

  return (
    <>
      <TableLayout
        data={data || []}
        columns={columns}
        isLoading={isLoading || initialLoading}
        pagination={options.pagination}
        handlePaginationChange={handlePaginationChange}
        handleSortingChange={handleSortingChange}
        handleSearchChange={handleSearchChange}
        totalRows={totalRows}
        enableSelection={true}
      />
      {deleteDialog && deleteData && (
        <UnitConversionDeleteDialog
          open={deleteDialog}
          onOpenChange={setDeleteDialog}
          conversion={deleteData}
          onSuccess={handleOperationSuccess}
        />
      )}
    </>
  );
}
