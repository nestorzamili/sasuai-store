'use client';

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye } from 'lucide-react';
import {
  IconCash,
  IconCreditCard,
  IconWallet,
  IconQrcode,
  IconBuildingBank,
  IconDots,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableLayout } from '@/components/layout/table-layout';
import { useFetch } from '@/hooks/use-fetch';
import { getPaginatedTransactions } from '../action';
import { formatRupiah } from '@/lib/currency';
import { TableFetchOptions } from '@/hooks/use-fetch';
import { TransactionDetailDialog } from './transaction-detail-dialog';
import { startOfDay, endOfDay } from 'date-fns';
import TransactionFilterToolbar from './transaction-filter-toolbar';
import {
  ProcessedTransaction,
  TransactionForTable,
  TransactionTableProps,
  SortingState,
  DateRange,
} from '@/lib/types/transaction';

// === CUSTOM HOOKS ===
const useTransactionFilters = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('ALL_METHODS');

  const clearFilters = () => {
    setDateRange(undefined);
    setMinAmount('');
    setMaxAmount('');
    setPaymentMethod('ALL_METHODS');
  };

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

const useTransactionTable = () => {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  const viewTransactionDetails = (id: string) => {
    setSelectedTransactionId(id);
    setDetailDialogOpen(true);
  };

  const closeDialog = () => {
    setDetailDialogOpen(false);
    setSelectedTransactionId(null);
  };

  return {
    detailDialogOpen,
    selectedTransactionId,
    viewTransactionDetails,
    closeDialog,
  };
};

// === CONSTANTS ===
const PAYMENT_METHOD_ICONS: Record<string, React.ReactNode> = {
  CASH: <IconCash size={16} className="text-muted-foreground" />,
  DEBIT: <IconCreditCard size={16} className="text-muted-foreground" />,
  E_WALLET: <IconWallet size={16} className="text-muted-foreground" />,
  QRIS: <IconQrcode size={16} className="text-muted-foreground" />,
  TRANSFER: <IconBuildingBank size={16} className="text-muted-foreground" />,
  OTHER: <IconDots size={16} className="text-muted-foreground" />,
};

// === MAIN COMPONENT ===
export function TransactionTable({}: TransactionTableProps) {
  const filters = useTransactionFilters();
  const tableState = useTransactionTable();

  const fetchTransactions = useCallback(
    async (options: TableFetchOptions) => {
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (
        options.filters?.dateRange &&
        typeof options.filters.dateRange === 'object'
      ) {
        const range = options.filters.dateRange as DateRange;
        if (range.from) {
          startDate = startOfDay(range.from);
        }
        if (range.to) {
          endDate = endOfDay(range.to);
        }
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

      const transactions: TransactionForTable[] = (response.data || []).map(
        (item: ProcessedTransaction) => ({
          id: item.id,
          tranId: item.tranId,
          createdAt: item.createdAt.toString(),
          totalAmount: item.pricing?.originalAmount || 0,
          finalAmount: item.pricing?.finalAmount || 0,
          paymentMethod: item.payment?.method || '',
          cashier: {
            name: item.cashier?.name || null,
          },
          member: item.member
            ? {
                name: item.member.name || 'Unknown',
              }
            : null,
          itemCount: item.itemCount || 0,
          discountAmount: item.pricing?.totalDiscount || 0,
          paymentAmount: item.payment?.amount || item.pricing?.finalAmount || 0,
          pointsEarned: item.pointsEarned || 0,
        }),
      );

      return {
        data: transactions,
        totalRows: response.pagination?.totalCount || 0,
      };
    },
    [], // Remove getPaginatedTransactions from dependencies as it's stable
  );

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
  } = useFetch<TransactionForTable[]>({
    fetchData: fetchTransactions,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'createdAt',
    initialSortDirection: true,
  });

  const handlePaginationChange = useCallback(
    (newPagination: { pageIndex: number; pageSize: number }) => {
      setPage(newPagination.pageIndex);
      setLimit(newPagination.pageSize);
    },
    [setPage, setLimit],
  );

  const handleSortingChange = useCallback(
    (newSorting: SortingState[]) => {
      setSortBy(newSorting);
    },
    [setSortBy],
  );

  const handleSearchChange = useCallback(
    (newSearch: string) => {
      setSearch(newSearch);
    },
    [setSearch],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string | DateRange | undefined) => {
      if (key === 'paymentMethod') {
        if (value === 'ALL_METHODS') {
          setFilters(
            (
              prev: Record<
                string,
                string | number | boolean | null | undefined
              >,
            ) => {
              const newFilters = { ...prev };
              delete newFilters[key];
              return newFilters;
            },
          );
          return;
        }
      }

      if (key === 'dateRange') {
        filters.setDateRange(value as DateRange | undefined);
      }

      if (key === 'minAmount') {
        filters.setMinAmount(value as string);
      }
      if (key === 'maxAmount') {
        filters.setMaxAmount(value as string);
      }

      setFilters(
        (
          prev: Record<string, string | number | boolean | null | undefined>,
        ) => ({
          ...prev,
          [key]: value as string | number | boolean | null | undefined,
        }),
      );
    },
    [
      filters.setDateRange,
      filters.setMinAmount,
      filters.setMaxAmount,
      setFilters,
    ],
  );

  const handleMinAmountChange = useCallback(
    (value: string) => {
      filters.setMinAmount(value);
      handleFilterChange('minAmount', value);
    },
    [filters.setMinAmount, handleFilterChange],
  );

  const handleMaxAmountChange = useCallback(
    (value: string) => {
      filters.setMaxAmount(value);
      handleFilterChange('maxAmount', value);
    },
    [filters.setMaxAmount, handleFilterChange],
  );

  const handlePaymentMethodChange = useCallback(
    (value: string) => {
      filters.setPaymentMethod(value);

      if (value === 'ALL_METHODS') {
        setFilters(
          (
            prev: Record<string, string | number | boolean | null | undefined>,
          ) => {
            const newFilters = { ...prev };
            delete newFilters['paymentMethod'];
            return newFilters;
          },
        );
      } else {
        handleFilterChange('paymentMethod', value);
      }
    },
    [filters.setPaymentMethod, setFilters, handleFilterChange],
  );

  // Memoize columns to prevent re-creation
  const columns: ColumnDef<TransactionForTable>[] = useMemo(
    () => [
      {
        header: 'Transaction ID',
        accessorKey: 'tranId',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('tranId')}</div>
        ),
      },
      {
        header: 'Original Amount',
        accessorKey: 'totalAmount',
        cell: ({ row }) => (
          <div>{formatRupiah(row.getValue('totalAmount'))}</div>
        ),
      },
      {
        header: 'Discount',
        accessorKey: 'discountAmount',
        cell: ({ row }) => {
          const discount = row.original.discountAmount || 0;
          if (discount === 0)
            return <span className="text-muted-foreground">-</span>;
          return (
            <div className="text-rose-500">- {formatRupiah(discount)}</div>
          );
        },
      },
      {
        header: 'Final Amount',
        accessorKey: 'finalAmount',
        cell: ({ row }) => (
          <div className="font-medium">
            {formatRupiah(row.getValue('finalAmount'))}
          </div>
        ),
        enableSorting: true,
      },
      {
        header: 'Customer',
        accessorKey: 'member.name',
        cell: ({ row }) => {
          if (!row.original.member)
            return <span className="text-muted-foreground">Guest</span>;
          return <div>{row.original.member.name}</div>;
        },
      },
      {
        header: 'Items',
        accessorKey: 'itemCount',
        cell: ({ row }) => {
          const count = row.original.itemCount || 0;
          return <div>{count} item(s)</div>;
        },
      },
      {
        header: 'Points',
        accessorKey: 'pointsEarned',
        cell: ({ row }) => {
          const points = row.original.pointsEarned || 0;
          if (points === 0)
            return <span className="text-muted-foreground">-</span>;
          return <span>{points} pts</span>;
        },
      },
      {
        header: 'Payment Amount',
        accessorKey: 'paymentAmount',
        cell: ({ row }) => {
          const amount = row.original.paymentAmount || row.original.finalAmount;
          return <div className="font-medium">{formatRupiah(amount)}</div>;
        },
      },
      {
        header: 'Payment',
        accessorKey: 'paymentMethod',
        cell: ({ row }) => {
          const method = row.getValue('paymentMethod') as string;
          return (
            <div className="flex items-center gap-x-2">
              {PAYMENT_METHOD_ICONS[method] || (
                <IconCash size={16} className="text-muted-foreground" />
              )}
              <span className="text-sm capitalize">
                {method.replace(/[_-]/g, ' ')}
              </span>
            </div>
          );
        },
      },
      {
        header: 'Cashier',
        accessorKey: 'cashier.name',
        cell: ({ row }) => <div>{row.original.cashier?.name || 'Unknown'}</div>,
      },
      {
        header: 'Date',
        accessorKey: 'createdAt',
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt') as string);
          return (
            <div className="flex flex-col">
              <span>{date.toLocaleDateString()}</span>
              <span className="text-xs text-muted-foreground">
                {date.toLocaleTimeString()}
              </span>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const transaction = row.original;
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
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() =>
                      tableState.viewTransactionDetails(transaction.id)
                    }
                  >
                    View Details <Eye className="h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [tableState.viewTransactionDetails],
  );

  // Memoize filter toolbar element
  const filterToolbarElement = useMemo(
    () => (
      <TransactionFilterToolbar
        dateRange={filters.dateRange}
        setDateRange={(range) => handleFilterChange('dateRange', range)}
        minAmount={filters.minAmount}
        setMinAmount={handleMinAmountChange}
        maxAmount={filters.maxAmount}
        setMaxAmount={handleMaxAmountChange}
        paymentMethod={filters.paymentMethod}
        setPaymentMethod={handlePaymentMethodChange}
      />
    ),
    [
      filters.dateRange,
      filters.minAmount,
      filters.maxAmount,
      filters.paymentMethod,
      handleFilterChange,
      handleMinAmountChange,
      handleMaxAmountChange,
      handlePaymentMethodChange,
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

      {/* Transaction Detail Dialog */}
      {tableState.selectedTransactionId && (
        <TransactionDetailDialog
          open={tableState.detailDialogOpen}
          onOpenChange={tableState.closeDialog}
          transactionId={tableState.selectedTransactionId}
        />
      )}
    </>
  );
}
