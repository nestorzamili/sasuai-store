'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { TransactionTable } from './_components/transaction-table';
import { TransactionDetailDialog } from './_components/transaction-detail-dialog';
import TransactionFilterToolbar from './_components/transaction-filter-toolbar';
import { getPaginatedTransactions } from './action';
import { startOfDay, endOfDay } from '@/lib/date';
import { useFetch, TableFetchOptions } from '@/hooks/use-fetch';
import type { ProcessedTransaction } from '@/lib/services/transaction/types';
import type { DateRange } from 'react-day-picker';

// === CUSTOM HOOKS ===
const useTransactionFilters = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('ALL_METHODS');

  const clearFilters = useCallback(() => {
    setDateRange(undefined);
    setMinAmount('');
    setMaxAmount('');
    setPaymentMethod('ALL_METHODS');
  }, []);

  return {
    dateRange,
    setDateRange,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    paymentMethod,
    setPaymentMethod,
    clearFilters,
  };
};

const useTransactionDialog = () => {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  const openDialog = useCallback((transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setDetailDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDetailDialogOpen(false);
    setSelectedTransactionId(null);
  }, []);

  return {
    detailDialogOpen,
    selectedTransactionId,
    openDialog,
    closeDialog,
  };
};

export default function TransactionsPage() {
  const t = useTranslations('transaction');
  const filters = useTransactionFilters();
  const dialog = useTransactionDialog();

  // Memoized fetch function for better performance
  const fetchTransactions = useCallback(async (options: TableFetchOptions) => {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (
      options.filters?.dateRange &&
      typeof options.filters.dateRange === 'object'
    ) {
      const range = options.filters.dateRange as DateRange;
      if (range.from) startDate = startOfDay(range.from);
      if (range.to) endDate = endOfDay(range.to);
    }

    let minAmountValue: number | undefined;
    let maxAmountValue: number | undefined;

    if (
      options.filters?.minAmount &&
      !isNaN(parseFloat(options.filters.minAmount as string))
    ) {
      minAmountValue = parseFloat(options.filters.minAmount as string);
    }

    if (
      options.filters?.maxAmount &&
      !isNaN(parseFloat(options.filters.maxAmount as string))
    ) {
      maxAmountValue = parseFloat(options.filters.maxAmount as string);
    }

    const response = await getPaginatedTransactions({
      page: (options.page ?? 0) + 1,
      pageSize: options.limit ?? 10,
      sortField: options.sortBy?.id || 'createdAt',
      sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
      search: options.search,
      paymentMethod: options.filters?.paymentMethod as string,
      startDate,
      endDate,
      minAmount: minAmountValue,
      maxAmount: maxAmountValue,
    });

    if (!response.success || !response.data) {
      return { data: [], totalRows: 0 };
    }

    return {
      data: response.data.transactions,
      totalRows: response.data.pagination.totalCount,
    };
  }, []);

  // UseFetch hook for data management
  const {
    data,
    isLoading,
    options,
    setPage,
    setLimit,
    setSortBy,
    setSearch,
    setFilters,
    totalRows,
  } = useFetch<ProcessedTransaction[]>({
    fetchData: fetchTransactions,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'createdAt',
    initialSortDirection: true,
  });

  // Filter change handler with optimized dependencies
  const handleFilterChange = useCallback(
    (key: string, value: string | DateRange | undefined) => {
      // Update local filter state
      switch (key) {
        case 'dateRange':
          filters.setDateRange(value as DateRange | undefined);
          break;
        case 'minAmount':
          filters.setMinAmount(value as string);
          break;
        case 'maxAmount':
          filters.setMaxAmount(value as string);
          break;
        case 'paymentMethod':
          filters.setPaymentMethod(value as string);
          break;
      }

      // Update useFetch filters with proper handling for different value types
      if (key === 'paymentMethod' && value === 'ALL_METHODS') {
        setFilters((prev) => {
          const newFilters = { ...prev };
          delete newFilters[key];
          return newFilters;
        });
      } else {
        setFilters((prev) => ({
          ...prev,
          [key]: value as string | number | boolean | null | undefined,
        }));
      }
    },
    [filters, setFilters], // Simplified dependencies
  );

  // Memoized filter toolbar
  const filterToolbar = useMemo(
    () => (
      <TransactionFilterToolbar
        dateRange={filters.dateRange}
        setDateRange={(range) => handleFilterChange('dateRange', range)}
        minAmount={filters.minAmount}
        setMinAmount={(value) => handleFilterChange('minAmount', value)}
        maxAmount={filters.maxAmount}
        setMaxAmount={(value) => handleFilterChange('maxAmount', value)}
        paymentMethod={filters.paymentMethod}
        setPaymentMethod={(value) => handleFilterChange('paymentMethod', value)}
      />
    ),
    [
      filters.dateRange,
      filters.minAmount,
      filters.maxAmount,
      filters.paymentMethod,
      handleFilterChange,
    ],
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <TransactionTable
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
        onViewDetails={dialog.openDialog}
        filterToolbar={filterToolbar}
      />

      {/* Transaction Detail Dialog */}
      {dialog.selectedTransactionId && (
        <TransactionDetailDialog
          open={dialog.detailDialogOpen}
          onOpenChange={dialog.closeDialog}
          transactionId={dialog.selectedTransactionId}
        />
      )}
    </div>
  );
}
