'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableLayout } from '@/components/layout/table-layout';

import { formatRupiah } from '@/lib/currency';
import type {
  DiscountWithCounts,
  DiscountType,
  DiscountApplyTo,
  DiscountTableProps,
} from '@/lib/services/discount/types';

// === MAIN COMPONENT ===
export function DiscountTable({
  data,
  isLoading,
  pagination,
  totalRows,
  onPaginationChange,
  onSortingChange,
  onSearchChange,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  filterToolbar,
}: DiscountTableProps) {
  const t = useTranslations('discount.table');
  const tFilters = useTranslations('discount.filters');

  // Memoize columns with translations
  const columns: ColumnDef<DiscountWithCounts>[] = useMemo(
    () => [
      {
        header: t('name'),
        accessorKey: 'name',
        cell: ({ row }) => (
          <span className="font-medium text-sm">{row.original.name}</span>
        ),
        enableSorting: true,
      },
      {
        header: t('code'),
        accessorKey: 'code',
        cell: ({ row }) => {
          if (!row.original.isGlobal) {
            return <span className="text-sm text-muted-foreground">-</span>;
          }

          return (
            <span className="text-sm text-foreground font-mono">
              {row.original.code || '-'}
            </span>
          );
        },
        enableSorting: true,
      },
      {
        header: t('typeValue'),
        accessorKey: 'type',
        cell: ({ row }) => {
          const type = row.original.type as DiscountType;
          const value = row.original.value;
          const displayValue =
            type === 'PERCENTAGE' ? `${value}%` : formatRupiah(value);

          return (
            <div className="text-sm font-medium text-foreground">
              {displayValue}
            </div>
          );
        },
        enableSorting: true,
      },
      {
        header: t('dateRange'),
        accessorKey: 'startDate',
        cell: ({ row }) => {
          const startDate = new Date(row.original.startDate);
          const endDate = new Date(row.original.endDate);

          return (
            <div className="flex flex-col">
              <span className="text-sm text-foreground">
                {format(startDate, 'dd MMM yyyy')} -{' '}
                {format(endDate, 'dd MMM yyyy')}
              </span>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        header: t('appliesTo'),
        accessorKey: 'applyTo',
        cell: ({ row }) => {
          const applyTo = row.original.applyTo as DiscountApplyTo;
          let translationKey = '';
          let count = 0;

          switch (applyTo) {
            case 'SPECIFIC_PRODUCTS':
              translationKey = 'specificProducts';
              count = row.original.relationCounts?.products || 0;
              break;
            case 'SPECIFIC_MEMBERS':
              translationKey = 'specificMembers';
              count = row.original.relationCounts?.members || 0;
              break;
            case 'SPECIFIC_MEMBER_TIERS':
              translationKey = 'memberTiers';
              count = row.original.relationCounts?.memberTiers || 0;
              break;
            case 'ALL':
            default:
              translationKey = 'allApplications';
              count = 0;
              break;
          }

          const baseText = tFilters(translationKey);
          const displayText = count > 0 ? `${baseText} (${count})` : baseText;

          return <div className="text-sm text-foreground">{displayText}</div>;
        },
        enableSorting: false,
      },
      {
        header: t('status'),
        accessorKey: 'isActive',
        cell: ({ row }) => (
          <Badge
            variant={row.original.isActive ? 'default' : 'secondary'}
            className="text-xs"
          >
            {row.original.isActive ? t('active') : t('inactive')}
          </Badge>
        ),
        enableSorting: true,
      },
      {
        header: t('usage'),
        accessorKey: 'usage',
        cell: ({ row }) => {
          const { usedCount, maxUses } = row.original.usage;
          return (
            <div className="flex flex-col">
              <span className="text-sm">
                {usedCount} / {maxUses || '∞'} {t('used')}
              </span>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const discount = row.original;
          const hasBeenUsed =
            discount.usage.usedCount > 0 ||
            discount._count.transactions > 0 ||
            discount._count.transactionItems > 0;

          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{t('actions')}</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => onView(discount)}
                  >
                    {t('viewDetails')} <Eye className="h-4 w-4" />
                  </DropdownMenuItem>

                  {/* Only show edit if discount hasn't been used */}
                  {!hasBeenUsed && (
                    <DropdownMenuItem
                      className="flex justify-between cursor-pointer"
                      onClick={() => onEdit(discount)}
                    >
                      {t('edit')} <Edit className="h-4 w-4" />
                    </DropdownMenuItem>
                  )}

                  {/* Toggle status action */}
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => onToggleStatus(discount)}
                  >
                    {discount.isActive ? t('deactivate') : t('activate')}
                    {discount.isActive ? (
                      <PowerOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>

                  {/* Only show delete if discount hasn't been used */}
                  {!hasBeenUsed && (
                    <DropdownMenuItem
                      className="flex justify-between cursor-pointer text-destructive"
                      onClick={() => onDelete(discount)}
                    >
                      {t('delete')} <Trash2 className="h-4 w-4" />
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [t, tFilters, onView, onEdit, onDelete, onToggleStatus],
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
