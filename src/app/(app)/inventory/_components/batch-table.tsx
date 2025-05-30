'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
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
import {
  ProductBatchWithProduct,
  TableFetchOptions,
  TableFetchResult,
  ProductBatchFormInitialData,
} from '@/lib/types/inventory';
import { BatchDeleteDialog } from './batch-delete-dialog';
import { BatchDetailDialog } from './batch-detail-dialog';
import { formatDate } from '@/lib/date';
import { formatRupiah } from '@/lib/currency';
import { useFetch } from '@/hooks/use-fetch';
import { TableLayout } from '@/components/layout/table-layout';
import { getAllBatches } from '../action';
import { BatchAdjustmentDialog } from './batch-adjustment-dialog';
import { UnitWithCounts } from '@/lib/types/unit';
import BatchFormDialog from './batch-form-dialog';
import BatchFilterToolbar from './batch-filter-toolbar';
import { DateRange } from 'react-day-picker';
import { startOfDay, endOfDay } from 'date-fns';
import { getAllUnits } from '@/app/(app)/products/units/action';
import { getAllCategories } from '@/app/(app)/products/categories/action';

interface BatchTableProps {
  onSetRefresh?: (refreshFn: () => void) => void;
  isActive?: boolean;
}

export function BatchTable({
  onSetRefresh,
  isActive = false,
}: BatchTableProps) {
  const t = useTranslations('inventory.batchTable');
  const [selectedBatchForDelete, setSelectedBatchForDelete] =
    useState<ProductBatchWithProduct | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [expiryDateRange, setExpiryDateRange] = useState<DateRange | undefined>(
    undefined,
  );
  const [minQuantity, setMinQuantity] = useState<string>('');
  const [maxQuantity, setMaxQuantity] = useState<string>('');
  const [includeExpired, setIncludeExpired] = useState<boolean>(true);
  const [includeOutOfStock, setIncludeOutOfStock] = useState<boolean>(true);
  const [categoryId, setCategoryId] = useState<string>('');

  const [selectedBatch, setSelectedBatch] =
    useState<ProductBatchWithProduct | null>(null);
  const [units, setUnits] = useState<UnitWithCounts[]>([]);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Determine if a batch is expired
  const isExpired = (expiryDate: Date): boolean => {
    return new Date(expiryDate) < new Date();
  };

  // Stabilize fetchBatchData with proper dependencies
  const fetchBatchData = useCallback(
    async (
      options: TableFetchOptions,
    ): Promise<TableFetchResult<ProductBatchWithProduct[]>> => {
      try {
        if (!isActive && !isInitialLoad) {
          return { data: [], totalRows: 0 };
        }

        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setIsLoading(true);

        let expiryDateStart: Date | undefined;
        let expiryDateEnd: Date | undefined;

        // Handle date range conversion from string filters
        if (options.filters?.expiryDateStart) {
          expiryDateStart = startOfDay(
            new Date(options.filters.expiryDateStart as string),
          );
        }
        if (options.filters?.expiryDateEnd) {
          expiryDateEnd = endOfDay(
            new Date(options.filters.expiryDateEnd as string),
          );
        }

        const response = await getAllBatches({
          page: (options.page || 0) + 1,
          pageSize: options.limit || 10,
          sortField: options.sortBy?.id || 'createdAt',
          sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
          search: options.search,
          expiryDateStart,
          expiryDateEnd,
          minRemainingQuantity: options.filters?.minQuantity as number,
          maxRemainingQuantity: options.filters?.maxQuantity as number,
          includeExpired: options.filters?.includeExpired as boolean,
          includeOutOfStock: options.filters?.includeOutOfStock as boolean,
          categoryId: options.filters?.categoryId as string,
        });

        if (abortControllerRef.current?.signal.aborted) {
          return { data: [], totalRows: 0 };
        }

        return {
          data: response.data?.data || [],
          totalRows: response.data?.meta.totalRows || 0,
        };
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching batch data:', error);
        }
        return { data: [], totalRows: 0 };
      } finally {
        setIsLoading(false);
      }
    },
    [isActive, isInitialLoad], // Remove memoizedFilters from here as it's handled by useFetch
  );

  // Use fetch hook first to get the setFilters function
  const {
    data,
    options,
    setPage,
    setLimit,
    setSortBy,
    setSearch,
    setFilters,
    totalRows,
    refresh,
  } = useFetch({
    fetchData: fetchBatchData,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'createdAt',
    initialSortDirection: true,
  });

  // Memoize handlers to prevent unnecessary re-renders
  const handleDeleteClick = useCallback((batch: ProductBatchWithProduct) => {
    setSelectedBatchForDelete(batch);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleViewDetails = useCallback((batch: ProductBatchWithProduct) => {
    setSelectedBatchId(batch.id);
    setIsDetailDialogOpen(true);
  }, []);

  const handleAdjust = useCallback((batch: ProductBatchWithProduct) => {
    setSelectedBatch(batch);
    setAdjustQtyDialog(true);
  }, []);

  const handleEdit = useCallback((batch: ProductBatchWithProduct) => {
    setSelectedBatch(batch);
    setFormDialog(true);
  }, []);

  // Now define the filter change handler that uses setFilters
  const handleFilterChange = useCallback(
    (key: string, value: unknown) => {
      setFilters(
        (
          prev: Record<string, string | number | boolean | null | undefined>,
        ) => ({
          ...prev,
          [key]: value as string | number | boolean | null | undefined,
        }),
      );
    },
    [setFilters],
  );

  // Handle adjust quantity
  const [adjustQtyDialog, setAdjustQtyDialog] = useState(false);
  // Handle edit batch
  const [formDialog, setFormDialog] = useState(false);

  // Define columns
  const columns = useMemo(
    (): ColumnDef<ProductBatchWithProduct>[] => [
      // Product column
      {
        accessorKey: 'product.name',
        header: t('columns.name'),
        cell: ({ row }) => {
          const product = row.original.product;
          return <div className="font-medium">{product.name}</div>;
        },
        enableSorting: false,
      },

      // Batch Code column
      {
        accessorKey: 'batchCode',
        header: t('columns.batchCode'),
        cell: ({ row }) => {
          return <div>{row.getValue('batchCode')}</div>;
        },
        enableSorting: false,
      },

      // Expiry Date column
      {
        accessorKey: 'expiryDate',
        header: t('columns.expireDate'),
        cell: ({ row }) => {
          const expiryDate = new Date(row.getValue('expiryDate'));
          const expired = isExpired(expiryDate);
          return (
            <div className="flex">
              <div className={expired ? 'text-destructive font-medium' : ''}>
                {formatDate(expiryDate)}
              </div>
              {expired && (
                <Badge variant="destructive" className="ml-2">
                  {t('status.expired')}
                </Badge>
              )}
            </div>
          );
        },
        enableSorting: true,
      },

      // Quantity column
      {
        accessorKey: 'remainingQuantity',
        header: t('columns.remainingQuantity'),
        cell: ({ row }) => {
          const quantity = row.getValue('remainingQuantity') as number;
          return <div>{quantity.toLocaleString()}</div>;
        },
        enableSorting: true,
      },

      // Buy Price column
      {
        accessorKey: 'buyPrice',
        header: t('columns.buyPrice'),
        cell: ({ row }) => {
          const buyPrice = row.getValue('buyPrice') as number;
          return <div className="font-medium">{formatRupiah(buyPrice)}</div>;
        },
        enableSorting: true,
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
                    <span className="sr-only">{t('actions.openMenu')}</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('actions.actions')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => handleViewDetails(batch)}
                  >
                    {t('actions.viewDetails')} <IconEye className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => {
                      handleAdjust(batch);
                    }}
                  >
                    {t('actions.adjustQuantity')}{' '}
                    <IconAdjustmentsHorizontal className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => handleEdit(batch)}
                  >
                    {t('actions.edit')} <IconEdit className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(batch)}
                    disabled={batch.remainingQuantity !== batch.initialQuantity}
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
    [handleViewDetails, handleAdjust, handleEdit, handleDeleteClick, t],
  );

  // handle pagination change
  const handlePaginationChange = useCallback(
    (newPagination: { pageIndex: number; pageSize: number }) => {
      setPage(newPagination.pageIndex);
      setLimit(newPagination.pageSize);
    },
    [setPage, setLimit],
  );

  // handle sorting change
  const handleSortingChange = useCallback(
    (newSorting: { id: string; desc: boolean }[]) => {
      setSortBy(newSorting);
    },
    [setSortBy],
  );

  // handle search change
  const handleSearchChange = useCallback(
    (search: string) => {
      setSearch(search);
    },
    [setSearch],
  );

  // Handle expiry date range change - convert DateRange to string filters
  const handleExpiryDateRangeChange = useCallback(
    (range: DateRange | undefined) => {
      setExpiryDateRange(range);

      if (range?.from) {
        handleFilterChange('expiryDateStart', range.from.toISOString());
      } else {
        handleFilterChange('expiryDateStart', undefined);
      }

      if (range?.to) {
        handleFilterChange('expiryDateEnd', range.to.toISOString());
      } else {
        handleFilterChange('expiryDateEnd', undefined);
      }
    },
    [handleFilterChange],
  );

  // Handle min quantity change
  const handleMinQuantityChange = useCallback(
    (value: string) => {
      setMinQuantity(value);
      handleFilterChange('minQuantity', value ? Number(value) : undefined);
    },
    [handleFilterChange],
  );

  // Handle max quantity change
  const handleMaxQuantityChange = useCallback(
    (value: string) => {
      setMaxQuantity(value);
      handleFilterChange('maxQuantity', value ? Number(value) : undefined);
    },
    [handleFilterChange],
  );

  // Handle include expired change
  const handleIncludeExpiredChange = useCallback(
    (value: boolean) => {
      setIncludeExpired(value);
      handleFilterChange('includeExpired', value);
    },
    [handleFilterChange],
  );

  // Handle include out of stock change
  const handleIncludeOutOfStockChange = useCallback(
    (value: boolean) => {
      setIncludeOutOfStock(value);
      handleFilterChange('includeOutOfStock', value);
    },
    [handleFilterChange],
  );

  // Handle category change
  const handleCategoryChange = useCallback(
    (value: string) => {
      setCategoryId(value);
      handleFilterChange('categoryId', value);
    },
    [handleFilterChange],
  );

  // Fetch units and categories when component mounts - memoized
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitsResponse, categoriesResponse] = await Promise.all([
          getAllUnits(),
          getAllCategories(),
        ]);

        if (unitsResponse.success && unitsResponse.data) {
          setUnits(unitsResponse.data.units);
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(
            categoriesResponse.data.categories.map((cat) => ({
              id: cat.id,
              name: cat.name,
            })),
          );
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    if (isActive) {
      fetchData();
    }
  }, [isActive]);

  // Optimize rendering by only refreshing data when tab becomes active
  useEffect(() => {
    if (isActive || isInitialLoad) {
      setIsInitialLoad(false);
      refresh();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isActive, refresh, isInitialLoad]);

  // Set refresh function if needed
  useEffect(() => {
    if (onSetRefresh) {
      onSetRefresh(refresh);
    }
  }, [onSetRefresh, refresh]);

  // Memoize the filter toolbar element
  const filterToolbarElement = useMemo(
    () => (
      <BatchFilterToolbar
        expiryDateRange={expiryDateRange}
        setExpiryDateRange={handleExpiryDateRangeChange}
        minQuantity={minQuantity}
        setMinQuantity={handleMinQuantityChange}
        maxQuantity={maxQuantity}
        setMaxQuantity={handleMaxQuantityChange}
        includeExpired={includeExpired}
        setIncludeExpired={handleIncludeExpiredChange}
        includeOutOfStock={includeOutOfStock}
        setIncludeOutOfStock={handleIncludeOutOfStockChange}
        categoryId={categoryId}
        setCategoryId={handleCategoryChange}
        categories={categories}
      />
    ),
    [
      expiryDateRange,
      handleExpiryDateRangeChange,
      minQuantity,
      handleMinQuantityChange,
      maxQuantity,
      handleMaxQuantityChange,
      includeExpired,
      handleIncludeExpiredChange,
      includeOutOfStock,
      handleIncludeOutOfStockChange,
      categoryId,
      handleCategoryChange,
      categories,
    ],
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
        filterToolbar={filterToolbarElement}
      />

      {/* Dialogs */}
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

      {/* Edit batch dialog */}
      {formDialog && selectedBatch && (
        <BatchFormDialog
          open={formDialog}
          onOpenChange={() => {
            setFormDialog(false);
          }}
          initialData={
            selectedBatch
              ? ({
                  id: selectedBatch.id,
                  productId: selectedBatch.productId,
                  batchCode: selectedBatch.batchCode,
                  expiryDate: selectedBatch.expiryDate,
                  initialQuantity: selectedBatch.initialQuantity,
                  buyPrice: selectedBatch.buyPrice,
                  unitId: selectedBatch.product.unitId,
                } as ProductBatchFormInitialData)
              : undefined
          }
          onSuccess={() => {
            setFormDialog(false);
            refresh();
          }}
        />
      )}
    </>
  );
}
