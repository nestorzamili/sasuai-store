'use client';
import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
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
  CategoryWithCount,
  CategoryFetchOptions,
  CategoryFetchResult,
} from '@/lib/types/category';
import { TableLayout } from '@/components/layout/table-layout';
import { CategoryDeleteDialog } from './category-delete-dialog';
import { useFetch } from '@/hooks/use-fetch';
import { getAllCategoriesWithCount } from '../action';

interface CategoryTableProps {
  onEdit?: (category: CategoryWithCount) => void;
  onRefresh?: () => void;
}

export function CategoryTable({ onEdit, onRefresh }: CategoryTableProps) {
  // State for delete dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteData, setDeleteData] = useState<CategoryWithCount | null>(null);

  // Memoized fetch function
  const fetchCategories = useCallback(
    async (
      options: CategoryFetchOptions,
    ): Promise<CategoryFetchResult<CategoryWithCount[]>> => {
      const response = await getAllCategoriesWithCount({
        page: (options.page ?? 0) + 1, // Convert 0-based to 1-based indexing
        limit: options.limit ?? 10,
        sortBy: options.sortBy?.id ?? 'name',
        sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
        query: options.search ?? '',
        columnFilter: options.columnFilter ?? ['name', 'description'],
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
  } = useFetch<CategoryWithCount[]>({
    fetchData: fetchCategories,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'name',
    initialSortDirection: false,
  });

  // Memoized handlers
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

  // Handle successful operations
  const handleOperationSuccess = useCallback((): void => {
    refresh();
    onRefresh?.();
  }, [refresh, onRefresh]);

  // Handle delete action
  const handleDeleteClick = useCallback((category: CategoryWithCount): void => {
    setDeleteData(category);
    setDeleteDialog(true);
  }, []);

  // Handle edit action
  const handleEditClick = useCallback(
    (category: CategoryWithCount): void => {
      onEdit?.(category);
    },
    [onEdit],
  );

  // Memoized columns
  const columns = useMemo(
    (): ColumnDef<CategoryWithCount>[] => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        ),
        enableSorting: true,
      },
      {
        header: 'Description',
        accessorKey: 'description',
        cell: ({ row }) => {
          const description = row.getValue('description') as string | null;
          return (
            <div className="max-w-[700px] truncate" title={description || ''}>
              {description ? (
                description
              ) : (
                <span className="text-muted-foreground italic">
                  No description
                </span>
              )}
            </div>
          );
        },
        enableSorting: true,
      },
      {
        header: 'Products Count',
        accessorKey: '_count.products',
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original._count?.products || 0} products
          </Badge>
        ),
        enableSorting: true,
      },
      {
        header: 'Created',
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
          const category = row.original;
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
                    onClick={() => handleEditClick(category)}
                  >
                    Edit <IconEdit className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(category)}
                  >
                    Delete <IconTrash className="h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [handleEditClick, handleDeleteClick],
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
        <CategoryDeleteDialog
          open={deleteDialog}
          onOpenChange={setDeleteDialog}
          category={deleteData}
          onSuccess={handleOperationSuccess}
        />
      )}
    </>
  );
}
