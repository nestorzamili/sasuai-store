'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import { DiscountTable } from './_components/discount-table';
import { DiscountFilterToolbar } from './_components/discount-filter-toolbar';
import { DiscountDetailDialog } from './_components/discount-detail-dialog';
import { DiscountDeleteDialog } from './_components/discount-delete-dialog';
import { getDiscounts, getDiscountById } from './action';
import { useFetch, type TableFetchOptions } from '@/hooks/use-fetch';
import type {
  DiscountWithCounts,
  DiscountWithRelations,
  DiscountType,
  DiscountApplyTo,
} from '@/lib/services/discount/types';

// === CUSTOM HOOKS ===
const useDiscountFilters = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [type, setType] = useState<DiscountType | 'ALL_TYPES'>('ALL_TYPES');
  const [applyTo, setApplyTo] = useState<DiscountApplyTo | 'ALL_APPLICATIONS'>(
    'ALL_APPLICATIONS',
  );
  const [status, setStatus] = useState<'ALL_STATUSES' | 'ACTIVE' | 'INACTIVE'>(
    'ALL_STATUSES',
  );

  // Memoize filter values to prevent unnecessary re-renders
  const filterValues = useMemo(
    () => ({
      dateRange,
      type,
      applyTo,
      status,
    }),
    [dateRange, type, applyTo, status],
  );

  // Convert filter values to API format - memoized to prevent recreating on every render
  const getApiFilters = useMemo(() => {
    return {
      startDate: dateRange?.from
        ? dateRange.from.toISOString().split('T')[0]
        : undefined,
      endDate: dateRange?.to
        ? dateRange.to.toISOString().split('T')[0]
        : undefined,
      type: type !== 'ALL_TYPES' ? type : undefined,
      applyTo: applyTo !== 'ALL_APPLICATIONS' ? applyTo : undefined,
      isActive: status === 'ALL_STATUSES' ? undefined : status === 'ACTIVE',
    };
  }, [dateRange, type, applyTo, status]);

  return {
    ...filterValues,
    setDateRange,
    setType,
    setApplyTo,
    setStatus,
    getApiFilters,
  };
};

const useDiscountDialogs = () => {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] =
    useState<DiscountWithCounts | null>(null);
  const [detailDiscount, setDetailDiscount] =
    useState<DiscountWithRelations | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const openDetailDialog = useCallback(async (discount: DiscountWithCounts) => {
    setSelectedDiscount(discount);
    setDetailDialogOpen(true);
    setDetailLoading(true);

    try {
      const response = await getDiscountById(discount.id);
      if (response.success && response.data) {
        setDetailDiscount(response.data as DiscountWithRelations);
      }
    } catch (error) {
      console.error('Error fetching discount details:', error);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openDeleteDialog = useCallback((discount: DiscountWithCounts) => {
    setSelectedDiscount(discount);
    setDeleteDialogOpen(true);
  }, []);

  const closeDialogs = useCallback(() => {
    setDetailDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedDiscount(null);
    setDetailDiscount(null);
    setDetailLoading(false);
  }, []);

  return {
    detailDialogOpen,
    deleteDialogOpen,
    selectedDiscount,
    detailDiscount,
    detailLoading,
    openDetailDialog,
    openDeleteDialog,
    closeDialogs,
  };
};

export default function DiscountsPage() {
  const t = useTranslations('discount');
  const router = useRouter();
  const dialogs = useDiscountDialogs();
  const filters = useDiscountFilters();

  // Navigation handlers
  const handleCreateNew = useCallback(() => {
    router.push('/discounts/new');
  }, [router]);

  const handleEdit = useCallback(
    (discount: DiscountWithCounts) => {
      router.push(`/discounts/${discount.id}/edit`);
    },
    [router],
  );

  // Memoized fetch function for better performance
  const fetchDiscounts = useCallback(
    async (options: TableFetchOptions) => {
      const response = await getDiscounts({
        page: (options.page ?? 0) + 1,
        pageSize: options.limit ?? 10,
        sortField: options.sortBy?.id || 'createdAt',
        sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
        search: options.search,
        // Apply current filter values
        ...filters.getApiFilters,
      });

      if (!response.success || !response.data) {
        return { data: [], totalRows: 0 };
      }

      return {
        data: response.data.discounts,
        totalRows: response.data.pagination.totalCount,
      };
    },
    [filters.getApiFilters],
  );

  // UseFetch hook for data management
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
  } = useFetch<DiscountWithCounts[]>({
    fetchData: fetchDiscounts,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'createdAt',
    initialSortDirection: true,
  });

  // Handle delete success - refresh data
  const handleDeleteSuccess = useCallback(() => {
    refresh();
    dialogs.closeDialogs();
  }, [refresh, dialogs]);

  // Debounced filter change effect - only refresh after user stops changing filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refresh();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [
    filters.dateRange,
    filters.type,
    filters.applyTo,
    filters.status,
    refresh,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          {t('new')}
        </Button>
      </div>

      <DiscountTable
        data={data || []}
        isLoading={isLoading}
        pagination={options.pagination}
        totalRows={totalRows}
        onPaginationChange={(newPagination) => {
          setPage(newPagination.pageIndex);
          setLimit(newPagination.pageSize);
        }}
        onSortingChange={(sorting) => {
          if (sorting.length > 0) {
            setSortBy([{ id: sorting[0].id, desc: sorting[0].desc }]);
          } else {
            setSortBy([]);
          }
        }}
        onSearchChange={setSearch}
        onView={dialogs.openDetailDialog}
        onEdit={handleEdit}
        onDelete={dialogs.openDeleteDialog}
        filterToolbar={
          <DiscountFilterToolbar
            dateRange={filters.dateRange}
            setDateRange={filters.setDateRange}
            type={filters.type}
            setType={filters.setType}
            applyTo={filters.applyTo}
            setApplyTo={filters.setApplyTo}
            status={filters.status}
            setStatus={filters.setStatus}
          />
        }
      />

      {/* Detail Dialog */}
      <DiscountDetailDialog
        open={dialogs.detailDialogOpen}
        onOpenChange={dialogs.closeDialogs}
        discount={dialogs.detailDiscount}
        isLoading={dialogs.detailLoading}
      />

      {/* Delete Dialog */}
      {dialogs.selectedDiscount && (
        <DiscountDeleteDialog
          open={dialogs.deleteDialogOpen}
          onOpenChange={dialogs.closeDialogs}
          discount={dialogs.selectedDiscount}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
