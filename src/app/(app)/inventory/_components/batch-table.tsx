'use client';
import * as React from 'react';
import { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  IconTrash,
  IconEdit,
  IconEye,
  IconAdjustmentsHorizontal,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProductBatchWithProduct } from '@/lib/types/product-batch';
import { BatchDeleteDialog } from './batch-delete-dialog';
import { BatchDetailDialog } from './batch-detail-dialog';
import { formatDate } from '@/lib/date';
import { formatRupiah } from '@/lib/currency';
import { useFetch } from '@/hooks/use-fetch';
import { TableLayout } from '@/components/layout/table-layout';
import { getAllBatchesOptimalized } from '../action';
import { BatchAdjustmentDialog } from './batch-adjustment-dialog';
import { UnitWithCounts } from '@/lib/types/unit';
import BatchPrimaryButton from './batch-primary-button';
import BatchFormDialog from './batch-form-dialog';

interface BatchTableProps {
  onSetRefresh?: (refreshFn: () => void) => void;
}

export function BatchTable({ onSetRefresh }: BatchTableProps) {
  const [selectedBatchForDelete, setSelectedBatchForDelete] =
    useState<ProductBatchWithProduct | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // New state for batch details dialog
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Handle delete click
  const handleDeleteClick = (batch: ProductBatchWithProduct) => {
    setSelectedBatchForDelete(batch);
    setIsDeleteDialogOpen(true);
  };

  // New handler for viewing batch details
  const handleViewDetails = (batch: ProductBatchWithProduct) => {
    setSelectedBatchId(batch.id);
    setIsDetailDialogOpen(true);
  };

  // Determine if a batch is expired
  const isExpired = (expiryDate: Date): boolean => {
    return new Date(expiryDate) < new Date();
  };

  // Define columns
  const columns: ColumnDef<ProductBatchWithProduct>[] = [
    // Product column
    {
      accessorKey: 'product.name',
      header: 'Name',
      cell: ({ row }) => {
        const product = row.original.product;
        return <div className="font-medium">{product.name}</div>;
      },
    },

    // Batch Code column
    {
      accessorKey: 'batchCode',
      header: 'batch code',
      cell: ({ row }) => {
        return <div className="ml-4">{row.getValue('batchCode')}</div>;
      },
    },

    // Expiry Date column
    {
      accessorKey: 'expiryDate',
      header: 'Expire Date',
      cell: ({ row }) => {
        const expiryDate = new Date(row.getValue('expiryDate'));
        const expired = isExpired(expiryDate);
        return (
          <div className="flex ml-4">
            <div className={expired ? 'text-destructive font-medium' : ''}>
              {formatDate(expiryDate)}
            </div>
            {expired && (
              <Badge variant="destructive" className="ml-2">
                Expired
              </Badge>
            )}
          </div>
        );
      },
    },

    // Quantity column
    {
      accessorKey: 'remainingQuantity',
      header: 'remaining quantity',
      cell: ({ row }) => {
        const quantity = row.getValue('remainingQuantity') as number;
        return <div className="ml-4">{quantity.toLocaleString()}</div>;
      },
    },

    // Buy Price column
    {
      accessorKey: 'buyPrice',
      header: 'buy price',
      cell: ({ row }) => {
        const buyPrice = row.getValue('buyPrice') as number;
        return <div className="ml-4 font-medium">{formatRupiah(buyPrice)}</div>;
      },
    },

    // Actions column
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const batch = row.original;
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
                  onClick={() => handleViewDetails(batch)}
                >
                  View Details <IconEye className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer"
                  onClick={() => {
                    handleAdjust(batch);
                  }}
                >
                  Adjust Quantity{' '}
                  <IconAdjustmentsHorizontal className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer"
                  onClick={() => handleEdit?.(batch)}
                >
                  Edit <IconEdit className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => handleDeleteClick(batch)}
                  disabled={batch.remainingQuantity !== batch.initialQuantity}
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
  // handle pagination change
  const handlePaginationChange = (newPagination: {
    pageIndex: number;
    pageSize: number;
  }) => {
    setPage(newPagination.pageIndex);
    setLimit(newPagination.pageSize);
  };
  // handle sorting change
  const handleSortingChange = (newSorting: any) => {
    setSortBy(newSorting);
  };
  // handle page change
  const handleSearchChange = (search: string) => {
    setSearch(search);
  };
  // Handle adjust quantity
  const [adjustQtyDialog, setAdjustQtyDialog] = useState(false);
  const handleAdjust = (batch: ProductBatchWithProduct) => {
    setSelectedBatch(batch);
    setAdjustQtyDialog(true);
  };
  // fetch data
  const fetchBatchData = async (options: any) => {
    try {
      const response = await getAllBatchesOptimalized({
        page: options.page + 1,
        limit: options.limit,
        sortBy: options.sortBy,
        search: options.search,
        columnFilter: ['id', 'product.name', 'batchCode'],
      });
      return {
        data: response.data,
        totalRows: response.meta?.rowsCount || 0,
      };
    } catch (error) {
      console.log(error);
      return {
        data: [],
        totalRows: 0,
      };
    }
  };
  // const [selectedBatch, setSelectedBatch] =
  // useState<ProductBatchWithProduct | null>(null);
  // Handle edit batch
  const [formDialog, setFormDialog] = useState(false);
  const handleEdit = (batch: ProductBatchWithProduct) => {
    setSelectedBatch(batch);
    setFormDialog(true);
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
  } = useFetch({
    fetchData: fetchBatchData,
    initialPageIndex: 0,
  });

  const [selectedBatch, setSelectedBatch] =
    useState<ProductBatchWithProduct | null>(null);
  const [units, setUnits] = useState<UnitWithCounts[]>([]);

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
      {/* Delete dialog */}
      {selectedBatchForDelete && (
        <BatchDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          batch={selectedBatchForDelete}
          onSuccess={refresh}
        />
      )}
      {isDetailDialogOpen && selectedBatchId && (
        <BatchDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          batchId={selectedBatchId}
        />
      )}

      {/* Batch adjustment dialog */}
      {adjustQtyDialog && selectedBatch && (
        <BatchAdjustmentDialog
          open={adjustQtyDialog}
          onOpenChange={(prev) => {
            setAdjustQtyDialog(!prev);
            setSelectedBatch(null);
          }}
          batch={selectedBatch}
          units={units}
          onSuccess={() => {
            setAdjustQtyDialog(false);
            refresh();
          }}
        />
      )}
      {/* Details dialog */}
      {formDialog && selectedBatch && (
        <BatchFormDialog
          open={formDialog}
          onOpenChange={() => {
            setFormDialog(false);
          }}
          initialData={
            selectedBatch
              ? {
                  id: selectedBatch.id,
                  productId: selectedBatch.productId,
                  batchCode: selectedBatch.batchCode,
                  expiryDate: selectedBatch.expiryDate,
                  initialQuantity: selectedBatch.initialQuantity,
                  buyPrice: selectedBatch.buyPrice,
                  unitId: selectedBatch.product.unitId,
                }
              : undefined
          }
          onSuccess={() => {
            setFormDialog(false);
            refresh();
          }}
        />
      )}
      {/* Batch primary button */}
    </>
  );
}
