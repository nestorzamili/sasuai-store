'use client';

import * as React from 'react';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableLayout } from '@/components/layout/table-layout';
import { useFetch } from '@/hooks/use-fetch';
import { getPaginatedTransactions } from '../action';
import { formatRupiah } from '@/lib/currency';
import { TableFetchOptions } from '@/hooks/use-fetch';
import { TransactionDetailDialog } from './transaction-detail-dialog';

interface Transaction {
  id: string;
  tranId: string;
  createdAt: string;
  totalAmount: number;
  finalAmount: number;
  paymentMethod: string;
  cashier: {
    name: string;
  };
  member?: {
    name: string;
  } | null;
  itemCount?: number;
  discountAmount?: number;
  paymentAmount?: number;
  pointsEarned?: number;
}

interface TransactionTableProps {
  onRefresh?: () => void;
  onSelectionChange?: (selectedRows: Transaction[]) => void;
}

const paymentMethodIcons: Record<string, React.ReactNode> = {
  CASH: <CreditCard size={16} className="text-muted-foreground" />,
  CREDIT_CARD: <CreditCard size={16} className="text-muted-foreground" />,
  DEBIT_CARD: <CreditCard size={16} className="text-muted-foreground" />,
  TRANSFER: <CreditCard size={16} className="text-muted-foreground" />,
};

export function TransactionTable({
  onRefresh,
  onSelectionChange,
}: TransactionTableProps) {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [selectedRows, setSelectedRows] = useState<Transaction[]>([]);

  const fetchTransactions = async (
    options: TableFetchOptions,
  ): Promise<{
    data: Transaction[];
    totalRows: number;
  }> => {
    const response = await getPaginatedTransactions({
      page: (options.page ?? 0) + 1,
      pageSize: options.limit ?? 10,
      sortField: options.sortBy?.id || 'createdAt',
      sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
      search: options.search,
    });

    const transactions: Transaction[] = (response.data || []).map(
      (item: any) => ({
        id: item.id,
        tranId: item.tranId || item.id,
        createdAt: item.createdAt,
        totalAmount: item.pricing?.originalAmount || 0,
        finalAmount: item.pricing?.finalAmount || 0,
        paymentMethod: item.payment?.method || '',
        cashier: {
          name: item.cashier?.name || 'Unknown',
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
  } = useFetch<Transaction[]>({
    fetchData: fetchTransactions,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'createdAt',
    initialSortDirection: true,
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

  const viewTransactionDetails = (id: string) => {
    setSelectedTransactionId(id);
    setDetailDialogOpen(true);
  };

  const columns: ColumnDef<Transaction>[] = [
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
      cell: ({ row }) => <div>{formatRupiah(row.getValue('totalAmount'))}</div>,
    },
    {
      header: 'Discount',
      accessorKey: 'discountAmount',
      cell: ({ row }) => {
        const discount = row.original.discountAmount || 0;
        if (discount === 0)
          return <span className="text-muted-foreground">-</span>;
        return <div className="text-rose-500">- {formatRupiah(discount)}</div>;
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
            {paymentMethodIcons[method] || (
              <CreditCard size={16} className="text-muted-foreground" />
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
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex justify-between cursor-pointer"
                  onClick={() => viewTransactionDetails(transaction.id)}
                >
                  View Details <Eye className="h-4 w-4" />
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

      {/* Transaction Detail Dialog */}
      {selectedTransactionId && (
        <TransactionDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          transactionId={selectedTransactionId}
        />
      )}
    </>
  );
}
