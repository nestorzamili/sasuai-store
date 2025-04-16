'use client';
import * as React from 'react';
import { useState } from 'react';
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
import { UnitConversionWithUnits, UnitWithCounts } from '@/lib/types/unit';
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
  const fetchConversions = async (options: any) => {
    const response = await getAllConversionsWithOptions({
      page: options.page + 1,
      limit: options.limit,
      sortBy: options.sortBy,
      search: options.search,
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
  } = useFetch<UnitConversionWithUnits[]>({
    fetchData: fetchConversions,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'fromUnit',
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
  const [deleteData, setDeleteData] = useState<UnitConversionWithUnits | null>(
    null,
  );

  // Handle successful operations
  const handleOperationSuccess = () => {
    refresh();
    onRefresh?.();
  };

  const columns: ColumnDef<UnitConversionWithUnits>[] = [
    // From Unit column
    {
      accessorKey: 'fromUnit',
      header: 'From Unit',
      cell: ({ row }) => {
        const fromUnit = row.original.fromUnit;
        return (
          <div className="font-medium">
            {fromUnit.name} ({fromUnit.symbol})
          </div>
        );
      },
    },

    // To Unit column
    {
      accessorKey: 'toUnit',
      header: 'To Unit',
      cell: ({ row }) => {
        const toUnit = row.original.toUnit;
        return (
          <div className="font-medium">
            {toUnit.name} ({toUnit.symbol})
          </div>
        );
      },
    },

    // Factor column
    {
      accessorKey: 'conversionFactor',
      header: 'Factor',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.conversionFactor}</div>
      ),
    },

    // Explanation column
    {
      id: 'explanation',
      header: 'Explanation',
      cell: ({ row }) => {
        const conversion = row.original;
        return (
          <div className="text-sm">
            1 {conversion.fromUnit.name} ({conversion.fromUnit.symbol}) ={' '}
            {conversion.conversionFactor} {conversion.toUnit.name} (
            {conversion.toUnit.symbol})
          </div>
        );
      },
      enableSorting: false,
    },

    // Actions column
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
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer"
                  onClick={() => onEdit?.(conversion)}
                >
                  Edit <IconEdit className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => {
                    setDeleteData(conversion);
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
      enableSorting: false,
    },
  ];

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
