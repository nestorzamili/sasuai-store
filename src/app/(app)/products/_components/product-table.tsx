'use client';

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableLayout } from '@/components/layout/table-layout';
import { useFetch } from '@/hooks/use-fetch';
import { getPaginatedProducts } from '../action';
import { formatRupiah } from '@/lib/currency';
import { ProductDeleteDialog } from './product-delete-dialog';
import { ProductWithRelations } from '@/lib/types/product';
import { TableFetchOptions } from '@/hooks/use-fetch';

interface ProductTableProps {
  onEdit?: (product: ProductWithRelations) => void;
  filterParams?: {
    isActive?: boolean;
    categoryId?: string;
    brandId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  filterToolbar?: React.ReactNode;
}

export function ProductTable({
  onEdit,
  filterParams,
  filterToolbar,
}: ProductTableProps) {
  const t = useTranslations('product.table');

  // Combine deletion dialog state
  const [deleteState, setDeleteState] = useState<{
    isOpen: boolean;
    product: ProductWithRelations | null;
  }>({
    isOpen: false,
    product: null,
  });

  // Define the fetch function for products - stabilize with useCallback
  const fetchProducts = useCallback(
    async (
      options: TableFetchOptions,
    ): Promise<{
      data: ProductWithRelations[];
      totalRows: number;
    }> => {
      const response = await getPaginatedProducts({
        page: (options.page ?? 0) + 1, // Convert from 0-indexed to 1-indexed
        pageSize: options.limit ?? 10,
        sortField: options.sortBy?.id || 'name',
        sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
        search: options.search,
        ...filterParams, // Apply additional filter params
        ...options.filters, // Apply filters from the table
      });

      if (response.success && response.data) {
        return {
          data: response.data.products as ProductWithRelations[],
          totalRows: response.data.totalCount,
        };
      }

      return {
        data: [],
        totalRows: 0,
      };
    },
    [filterParams], // Only depend on filterParams which should be stable
  );

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
  } = useFetch<ProductWithRelations[]>({
    fetchData: fetchProducts,
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
    (newSorting: { id: string; desc: boolean }[]) => {
      setSortBy(newSorting);
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

  // Handle delete confirmation - stabilize with useCallback
  const handleDeleteClick = useCallback((product: ProductWithRelations) => {
    setDeleteState({ isOpen: true, product });
  }, []);

  // Handle dialog open state change - stabilize with useCallback
  const handleDeleteDialogChange = useCallback((isOpen: boolean) => {
    setDeleteState((prev) => ({ ...prev, isOpen }));
  }, []);

  // Handle delete success - stabilize with useCallback
  const handleDeleteSuccess = useCallback(() => {
    refresh(); // Refresh the data after successful deletion
  }, [refresh]);

  // Define table columns - memoize to prevent re-creation
  const columns: ColumnDef<ProductWithRelations>[] = useMemo(
    () => [
      {
        header: t('columns.productName'),
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        ),
        enableSorting: false,
      },
      {
        header: t('columns.description'),
        accessorKey: 'description',
        cell: ({ row }) => {
          const description =
            row.original.description || t('placeholders.noDescription');
          return (
            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
              {description}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        header: t('columns.category'),
        accessorKey: 'category.name',
        cell: ({ row }) => <div>{row.original.category.name}</div>,
        enableSorting: false,
      },
      {
        header: t('columns.brand'),
        accessorKey: 'brand.name',
        cell: ({ row }) => (
          <div>{row.original.brand?.name || t('placeholders.noBrand')}</div>
        ),
        enableSorting: false,
      },
      {
        header: t('columns.barcode'),
        accessorKey: 'barcode',
        cell: ({ row }) => (
          <div>{row.original.barcode || t('placeholders.noBarcode')}</div>
        ),
        enableSorting: false,
      },
      {
        header: t('columns.price'),
        accessorKey: 'price',
        cell: ({ row }) => (
          <div className="text-left">{formatRupiah(row.original.price)}</div>
        ),
        enableSorting: true,
      },
      {
        header: t('columns.stock'),
        accessorKey: 'currentStock',
        cell: ({ row }) => {
          const stock = row.original.currentStock;
          return (
            <div className="text-left">
              <Badge
                variant={
                  stock <= 5
                    ? 'destructive'
                    : stock <= 10
                      ? 'secondary'
                      : 'outline'
                }
              >
                {stock} {row.original.unit.symbol}
              </Badge>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        header: t('columns.status'),
        accessorKey: 'isActive',
        cell: ({ row }) => {
          return row.original.isActive ? (
            <Badge>{t('status.active')}</Badge>
          ) : (
            <Badge variant="secondary">{t('status.inactive')}</Badge>
          );
        },
        enableSorting: true,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const product = row.original;
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
                    onClick={() => onEdit?.(product)}
                  >
                    {t('actions.edit')} <IconEdit className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(product)}
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
    [t, onEdit, handleDeleteClick],
  );

  return (
    <>
      {/* Table Layout Component */}
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
        filterToolbar={filterToolbar}
      />

      {/* Delete dialog */}
      {deleteState.isOpen && deleteState.product && (
        <ProductDeleteDialog
          open={deleteState.isOpen}
          onOpenChange={handleDeleteDialogChange}
          product={deleteState.product}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
