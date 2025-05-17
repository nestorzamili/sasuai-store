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
import { UnitWithCounts } from '@/lib/types/unit';
import { TableLayout } from '@/components/layout/table-layout';
import { UnitDeleteDialog } from './unit-delete-dialog';
import { useFetch } from '@/hooks/use-fetch';
import { getAllUnitsWithCounts } from '../action';

interface UnitTableProps {
  onEdit?: (unit: UnitWithCounts) => void;
  onRefresh?: () => void;
}

export function UnitTable({ onEdit, onRefresh }: UnitTableProps) {
  const fetchUnits = async (options: any) => {
    const response = await getAllUnitsWithCounts({
      page: options.page + 1,
      limit: options.limit,
      sortBy: options.sortBy,
      search: options.search,
      columnFilter: ['name', 'symbol'],
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
  } = useFetch<UnitWithCounts[]>({
    fetchData: fetchUnits,
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
  const [deleteData, setDeleteData] = useState<UnitWithCounts | null>(null);

  // Handle successful operations
  const handleOperationSuccess = () => {
    refresh();
    onRefresh?.();
  };

  // Calculate if a unit is in use
  const isUnitInUse = (unit: UnitWithCounts): boolean => {
    return !!(
      (unit._count?.products && unit._count.products > 0) ||
      (unit._count?.stockIns && unit._count.stockIns > 0) ||
      (unit._count?.stockOuts && unit._count.stockOuts > 0) ||
      (unit._count?.transactionItems && unit._count.transactionItems > 0)
    );
  };

  const columns: ColumnDef<UnitWithCounts>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
      enableSorting: true,
    },
    {
      header: 'Symbol',
      accessorKey: 'symbol',
      cell: ({ row }) => (
        <div className="font-mono">{row.getValue('symbol')}</div>
      ),
      enableSorting: true,
    },
    {
      header: 'Usage',
      id: 'usage',
      cell: ({ row }) => {
        const unit = row.original;
        const counts = unit._count || {};
        const productVariants = counts.products || 0;
        const stockIns = counts.stockIns || 0;
        const stockOuts = counts.stockOuts || 0;
        const transactions = counts.transactionItems || 0;

        return (
          <div className="flex flex-wrap gap-1">
            {productVariants > 0 && (
              <Badge variant="outline" className="text-xs">
                {productVariants} products
              </Badge>
            )}
            {stockIns > 0 && (
              <Badge variant="outline" className="text-xs">
                {stockIns} stock-ins
              </Badge>
            )}
            {stockOuts > 0 && (
              <Badge variant="outline" className="text-xs">
                {stockOuts} stock-outs
              </Badge>
            )}
            {transactions > 0 && (
              <Badge variant="outline" className="text-xs">
                {transactions} transactions
              </Badge>
            )}
            {productVariants === 0 &&
              stockIns === 0 &&
              stockOuts === 0 &&
              transactions === 0 && (
                <span className="text-muted-foreground italic text-xs">
                  Not in use
                </span>
              )}
          </div>
        );
      },
    },
    {
      header: 'Conversions',
      id: 'conversions',
      cell: ({ row }) => {
        const unit = row.original;
        const counts = unit._count || {};
        const fromConversions = counts.fromUnitConversions || 0;
        const toConversions = counts.toUnitConversions || 0;
        const totalConversions = fromConversions + toConversions;

        return (
          <Badge variant="outline" className="text-xs">
            {totalConversions} conversions
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const unit = row.original;
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
                  onClick={() => onEdit?.(unit)}
                >
                  Edit <IconEdit className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => {
                    setDeleteData(unit);
                    setDeleteDialog(true);
                  }}
                  disabled={isUnitInUse(unit)}
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
