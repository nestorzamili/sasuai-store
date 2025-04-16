'use client';
import * as React from 'react';
import { useState } from 'react';
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
import { CategoryWithCount } from '@/lib/types/category';
import { TableLayout } from '@/components/layout/table-layout';
import { CategoryDeleteDialog } from './category-delete-dialog';
import { useFetch } from '@/hooks/use-fetch';
import { getAllCategoriesWithCount } from '../action';

interface CategoryTableProps {
  onEdit?: (category: CategoryWithCount) => void;
  onRefresh?: () => void;
}

export function CategoryTable({ onEdit, onRefresh }: CategoryTableProps) {
  const fetchCategories = async (options: any) => {
    const response = await getAllCategoriesWithCount({
      page: options.page + 1,
      limit: options.limit,
      sortBy: options.sortBy,
      search: options.search,
      columnFilter: ['name', 'description'],
    });
    return {
      data: response.data || [],
      totalRows: response.totalRows || 0,
    };
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
  } = useFetch<CategoryWithCount[]>({
    fetchData: fetchCategories,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'name',
    initialSortDirection: false,
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

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteData, setDeleteData] = useState<CategoryWithCount | null>(null);

  // Handle successful operations
  const handleOperationSuccess = () => {
    refresh();
    onRefresh?.();
  };

  const columns: ColumnDef<CategoryWithCount>[] = [
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
        const description = row.getValue('description') as string;
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
    },
    {
      header: 'Products Count',
      accessorKey: '_count.products',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.original._count?.products || 0} products
        </Badge>
      ),
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
                  onClick={() => onEdit?.(category)}
                >
                  Edit <IconEdit className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => {
                    setDeleteData(category);
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
