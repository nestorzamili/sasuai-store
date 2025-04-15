'use client';
import * as React from 'react';
import { useState } from 'react';
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
import { useFetch } from '@/hooks/use-fetch';
import { getAllSuppliersWithCount } from '../action';

interface SupplierTableProps {
  onEdit?: (supplier: SupplierWithCount) => void;
  onRefresh?: () => void;
}

export function SupplierTable({ onEdit, onRefresh }: SupplierTableProps) {
  const fetchSuppliers = async (options: any) => {
    const response = await getAllSuppliersWithCount({
      page: options.page + 1,
      limit: options.limit,
      sortBy: options.sortBy,
      search: options.search,
      columnFilter: ['name', 'contact'],
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
  } = useFetch<SupplierWithCount[]>({
    fetchData: fetchSuppliers,
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
  const [detailDialog, setDetailDialog] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteData, setDeleteData] = useState<SupplierWithCount | null>(null);

  // Handle successful operations
  const handleOperationSuccess = () => {
    refresh();
    onRefresh?.();
  };

  const columns: ColumnDef<SupplierWithCount>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
      enableSorting: true,
    },
    {
      header: 'Contact',
      accessorKey: 'contact',
      cell: ({ row }) => {
        const contact = row.getValue('contact') as string;
        return (
          <div className="max-w-[700px] truncate" title={contact || ''}>
            {contact ? (
              contact
            ) : (
              <span className="text-muted-foreground italic">
                No contact info
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Stock-Ins Count',
      accessorKey: '_count.stockIns',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.original._count?.stockIns || 0} stock-ins
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
                    setDetailId(supplier.id);
                    setDetailDialog(true);
                  }}
                >
                  View Details <IconEye className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer"
                  onClick={() => onEdit?.(supplier)}
                >
                  Edit <IconEdit className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => {
                    setDeleteData(supplier);
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
