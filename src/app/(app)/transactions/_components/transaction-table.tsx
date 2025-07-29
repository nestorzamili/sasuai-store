'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableLayout } from '@/components/layout/table-layout';
import { formatRupiah } from '@/lib/currency';
import { formatDateShort, formatTime } from '@/lib/date';
import { getPaymentMethodIcon, getPaymentMethodText } from './shared-utils';
import type { ProcessedTransaction } from '@/lib/services/transaction/types';

// === LOCAL TYPES ===
interface TransactionTableProps {
  data: ProcessedTransaction[];
  isLoading: boolean;
  pagination: { pageIndex: number; pageSize: number };
  totalRows: number;
  onPaginationChange: (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => void;
  onSortingChange: (sorting: Array<{ id: string; desc: boolean }>) => void;
  onSearchChange: (search: string) => void;
  onViewDetails: (transactionId: string) => void;
  filterToolbar?: React.ReactNode;
}

// === MAIN COMPONENT ===
export function TransactionTable({
  data,
  isLoading,
  pagination,
  totalRows,
  onPaginationChange,
  onSortingChange,
  onSearchChange,
  onViewDetails,
  filterToolbar,
}: TransactionTableProps) {
  const t = useTranslations('transaction.table');

  // Memoize columns with translations
  const columns: ColumnDef<ProcessedTransaction>[] = useMemo(
    () => [
      {
        header: t('columns.tranId'),
        accessorKey: 'tranId',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('tranId')}</div>
        ),
        enableSorting: false,
      },
      {
        header: t('columns.totalAmount'),
        accessorKey: 'pricing.originalAmount',
        cell: ({ row }) => (
          <div>{formatRupiah(row.original.pricing.originalAmount)}</div>
        ),
        enableSorting: true,
      },
      {
        header: t('columns.discount'),
        accessorKey: 'pricing.totalDiscount',
        cell: ({ row }) => {
          const discount = row.original.pricing.totalDiscount || 0;
          if (discount === 0)
            return <span className="text-muted-foreground">-</span>;
          return (
            <div className="text-rose-500">- {formatRupiah(discount)}</div>
          );
        },
        enableSorting: false,
      },
      {
        header: t('columns.finalAmount'),
        accessorKey: 'pricing.finalAmount',
        cell: ({ row }) => (
          <div className="font-medium">
            {formatRupiah(row.original.pricing.finalAmount)}
          </div>
        ),
        enableSorting: true,
      },
      {
        header: t('columns.member'),
        accessorKey: 'member.name',
        cell: ({ row }) => {
          if (!row.original.member)
            return (
              <span className="text-muted-foreground">{t('noMember')}</span>
            );
          return <div>{row.original.member.name}</div>;
        },
        enableSorting: false,
      },
      {
        header: t('columns.items'),
        accessorKey: 'itemCount',
        cell: ({ row }) => {
          const count = row.original.itemCount || 0;
          return <div>{t('itemsCount', { count })}</div>;
        },
        enableSorting: true,
      },
      {
        header: t('columns.points'),
        accessorKey: 'pointsEarned',
        cell: ({ row }) => {
          const points = row.original.pointsEarned || 0;
          if (points === 0)
            return <span className="text-muted-foreground">-</span>;
          return <span>{points} pts</span>;
        },
        enableSorting: true,
      },
      {
        header: t('columns.paymentAmount'),
        accessorKey: 'payment.amount',
        cell: ({ row }) => {
          const amount =
            row.original.payment.amount || row.original.pricing.finalAmount;
          return <div className="font-medium">{formatRupiah(amount)}</div>;
        },
        enableSorting: true,
      },
      {
        header: t('columns.paymentMethod'),
        accessorKey: 'payment.method',
        cell: ({ row }) => {
          const method = row.original.payment.method;
          const methodText = getPaymentMethodText(method, t);

          return (
            <div className="flex items-center gap-x-2">
              {getPaymentMethodIcon(method, 16, 'text-muted-foreground')}
              <span className="text-sm capitalize">{methodText}</span>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        header: t('columns.cashier'),
        accessorKey: 'cashier.name',
        cell: ({ row }) => <div>{row.original.cashier?.name || 'Unknown'}</div>,
      },
      {
        header: t('columns.date'),
        accessorKey: 'createdAt',
        cell: ({ row }) => {
          const date = row.original.createdAt;
          return (
            <div className="flex flex-col">
              <span>{formatDateShort(date)}</span>
              <span className="text-xs text-muted-foreground">
                {formatTime(date)}
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
                    <span className="sr-only">{t('actions.openMenu')}</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => onViewDetails(transaction.id)}
                  >
                    {t('actions.viewDetails')} <Eye className="h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [t, onViewDetails],
  );

  return (
    <TableLayout
      data={data}
      columns={columns}
      isLoading={isLoading}
      pagination={pagination}
      handlePaginationChange={onPaginationChange}
      handleSortingChange={onSortingChange}
      handleSearchChange={onSearchChange}
      totalRows={totalRows}
      enableSelection={true}
      filterToolbar={filterToolbar}
    />
  );
}
