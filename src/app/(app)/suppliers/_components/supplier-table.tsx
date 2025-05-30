'use client';
import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconTrash, IconEdit, IconEye } from '@tabler/icons-react';
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
import { SupplierDeleteDialog } from './supplier-delete-dialog';
import { SupplierDetailDialog } from './supplier-detail-dialog';
import { SupplierWithCount } from '@/lib/types/supplier';
import {
  TableFetchOptions,
  SortByOptions,
  normalizeSortOption,
} from '@/lib/types/table';
import { useFetch } from '@/hooks/use-fetch';
import { getAllSuppliersWithCount } from '../action';

interface SupplierTableProps {
  onEdit?: (supplier: SupplierWithCount) => void;
  onRefresh?: () => void;
}

export function SupplierTable({ onEdit, onRefresh }: SupplierTableProps) {
  const t = useTranslations('supplier.table');

  const fetchSuppliers = useCallback(async (options: TableFetchOptions) => {
    // Convert TableFetchOptions to SupplierOptions using the helper
    const response = await getAllSuppliersWithCount({
      page: options.page !== undefined ? options.page + 1 : 1,
      limit: options.limit,
      sortBy: normalizeSortOption(options.sortBy),
      search: options.search,
      columnFilter: ['name', 'contact'],
    });

    return {
      data: response.data || [],
      totalRows: response.totalRows || 0,
    };
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
    refresh,
  } = useFetch<SupplierWithCount[]>({
    fetchData: fetchSuppliers,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'name',
    initialSortDirection: false,
  });

  const handlePaginationChange = useCallback(
    (newPagination: { pageIndex: number; pageSize: number }) => {
      setPage(newPagination.pageIndex);
      setLimit(newPagination.pageSize);
    },
    [setPage, setLimit],
  );

  const handleSortingChange = useCallback(
    (newSorting: SortByOptions) => {
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

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteData, setDeleteData] = useState<SupplierWithCount | null>(null);

  // Handle successful operations - stabilize with useCallback
  const handleOperationSuccess = useCallback(() => {
    refresh();
    onRefresh?.();
  }, [refresh, onRefresh]);

  // Handle detail dialog - stabilize with useCallback
  const handleViewDetails = useCallback((supplier: SupplierWithCount) => {
    setDetailId(supplier.id);
    setDetailDialog(true);
  }, []);

  // Handle delete dialog - stabilize with useCallback
  const handleDeleteClick = useCallback((supplier: SupplierWithCount) => {
    setDeleteData(supplier);
    setDeleteDialog(true);
  }, []);

  // Memoized columns with translations
  const columns: ColumnDef<SupplierWithCount>[] = useMemo(
    () => [
      {
        header: t('columns.name'),
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        ),
        enableSorting: false,
      },
      {
        header: t('columns.contact'),
        accessorKey: 'contact',
        cell: ({ row }) => {
          const contact = row.getValue('contact') as string;
          return (
            <div className="max-w-[700px] truncate" title={contact || ''}>
              {contact ? (
                contact
              ) : (
                <span className="text-muted-foreground italic">
                  {t('noContact')}
                </span>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        header: t('columns.stockIns'),
        accessorKey: '_count.stockIns',
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original._count?.stockIns || 0}{' '}
            {t('columns.stockIns').toLowerCase()}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const supplier = row.original;
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
                    onClick={() => handleViewDetails(supplier)}
                  >
                    {t('actions.viewDetails')} <IconEye className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => onEdit?.(supplier)}
                  >
                    {t('actions.edit')} <IconEdit className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(supplier)}
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
    [t, handleViewDetails, onEdit, handleDeleteClick],
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
        <SupplierDeleteDialog
          open={deleteDialog}
          onOpenChange={setDeleteDialog}
          supplier={deleteData}
          onSuccess={handleOperationSuccess}
        />
      )}
      {detailDialog && (
        <SupplierDetailDialog
          open={detailDialog}
          onOpenChange={setDetailDialog}
          supplierId={detailId}
        />
      )}
    </>
  );
}
