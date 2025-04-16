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
import { BrandWithCount } from '@/lib/types/brand';
import { TableLayout } from '@/components/layout/table-layout';
import { BrandDeleteDialog } from './brand-delete-dialog';
import { useFetch } from '@/hooks/use-fetch';
import { getAllBrandsWithCount } from '../action';

interface BrandTableProps {
  onEdit?: (brand: BrandWithCount) => void;
  onRefresh?: () => void;
}

export function BrandTable({ onEdit, onRefresh }: BrandTableProps) {
  const fetchBrands = async (options: any) => {
    const response = await getAllBrandsWithCount({
      page: options.page + 1,
      limit: options.limit,
      sortBy: options.sortBy,
      search: options.search,
      columnFilter: ['name'],
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
  } = useFetch<BrandWithCount[]>({
    fetchData: fetchBrands,
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
  const [deleteData, setDeleteData] = useState<BrandWithCount | null>(null);

  // Handle successful operations
  const handleOperationSuccess = () => {
    refresh();
    onRefresh?.();
  };

  const columns: ColumnDef<BrandWithCount>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
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
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const brand = row.original;
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
                  onClick={() => onEdit?.(brand)}
                >
                  Edit <IconEdit className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => {
                    setDeleteData(brand);
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
        <BrandDeleteDialog
          open={deleteDialog}
          onOpenChange={setDeleteDialog}
          brand={deleteData}
          onSuccess={handleOperationSuccess}
        />
      )}
    </>
  );
}
