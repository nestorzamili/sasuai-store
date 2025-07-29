'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IconFilterOff, IconCurrencyDollar } from '@tabler/icons-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/currency';
import { DateRangePickerWithPresets } from '@/components/ui/date-range-picker-with-presets';
import { getPaymentMethodIcon } from './shared-utils';
import type { DateRange } from 'react-day-picker';

// === LOCAL TYPES ===
interface TransactionFilterToolbarProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  minAmount: string;
  setMinAmount: (amount: string) => void;
  maxAmount: string;
  setMaxAmount: (amount: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

export default function TransactionFilterToolbar({
  dateRange,
  setDateRange,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  paymentMethod,
  setPaymentMethod,
}: TransactionFilterToolbarProps) {
  const t = useTranslations('transaction.filters');

  // State for the amount popover
  const [amountOpen, setAmountOpen] = useState(false);
  const [tempMinAmount, setTempMinAmount] = useState(minAmount);
  const [tempMaxAmount, setTempMaxAmount] = useState(maxAmount);

  // Determine if any filters are active
  const hasActiveFilters = !!(
    dateRange ||
    minAmount ||
    maxAmount ||
    paymentMethod !== 'ALL_METHODS'
  );

  // Payment method options with translations - using helper function
  const paymentMethods = [
    {
      value: 'cash',
      label: t('paymentMethods.cash'),
      icon: getPaymentMethodIcon('cash', 16),
    },
    {
      value: 'debit',
      label: t('paymentMethods.debit'),
      icon: getPaymentMethodIcon('debit', 16),
    },
    {
      value: 'e_wallet',
      label: t('paymentMethods.e_wallet'),
      icon: getPaymentMethodIcon('e_wallet', 16),
    },
    {
      value: 'qris',
      label: t('paymentMethods.qris'),
      icon: getPaymentMethodIcon('qris', 16),
    },
    {
      value: 'transfer',
      label: t('paymentMethods.transfer'),
      icon: getPaymentMethodIcon('transfer', 16),
    },
    {
      value: 'other',
      label: t('paymentMethods.other'),
      icon: getPaymentMethodIcon('other', 16),
    },
  ];

  // Update temporary amount values when main values change
  useEffect(() => {
    setTempMinAmount(minAmount);
    setTempMaxAmount(maxAmount);
  }, [minAmount, maxAmount]);

  // Generate amount button label with translations
  const getAmountButtonLabel = () => {
    if (minAmount && maxAmount) {
      return `${formatRupiah(minAmount)} - ${formatRupiah(maxAmount)}`;
    } else if (minAmount) {
      return `${t('minAmount')}: ${formatRupiah(minAmount)}`;
    } else if (maxAmount) {
      return `${t('maxAmount')}: ${formatRupiah(maxAmount)}`;
    }
    return t('amountRange');
  };

  // Handle amount filter apply - stabilize with useCallback
  const handleApplyAmountFilter = useCallback(() => {
    setMinAmount(tempMinAmount);
    setMaxAmount(tempMaxAmount);
    setAmountOpen(false);
  }, [tempMinAmount, tempMaxAmount, setMinAmount, setMaxAmount]);

  // Reset amount filter - stabilize with useCallback
  const handleResetAmountFilter = useCallback(() => {
    setTempMinAmount('');
    setTempMaxAmount('');
    setMinAmount('');
    setMaxAmount('');
    setAmountOpen(false);
  }, [setMinAmount, setMaxAmount]);

  // Handle clearing all filters - stabilize with useCallback
  const handleClearAllFilters = useCallback(() => {
    setDateRange(undefined);
    setMinAmount('');
    setMaxAmount('');
    setPaymentMethod('ALL_METHODS');
  }, [setDateRange, setMinAmount, setMaxAmount, setPaymentMethod]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range Picker with compact display - same as batch filter */}
        <div className="w-[200px]">
          <DateRangePickerWithPresets
            value={dateRange}
            onChange={setDateRange}
            align="start"
            className="w-full"
            isCompact={true}
            placeholder={t('dateRange')}
          />
        </div>

        {/* Amount Range - Using Popover */}
        <Popover open={amountOpen} onOpenChange={setAmountOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[180px] justify-between gap-2',
                (minAmount || maxAmount) && 'border-primary text-primary',
              )}
            >
              <IconCurrencyDollar size={18} />
              <span className="truncate">{getAmountButtonLabel()}</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-auto h-4 w-4 shrink-0 opacity-50"
              >
                <path
                  d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.26618 11.9026 7.38064 11.95 7.49999 11.95C7.61933 11.95 7.73379 11.9026 7.81819 11.8182L10.0682 9.56819Z"
                  fill="currentColor"
                />
              </svg>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{t('amountRange')}</h4>
                {(tempMinAmount || tempMaxAmount) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetAmountFilter}
                    className="h-7 px-2 text-xs"
                  >
                    {t('reset')}
                  </Button>
                )}
              </div>

              {/* Amount Input Fields */}
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground block mb-1">
                    {t('minAmount')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      Rp
                    </span>
                    <Input
                      type="number"
                      value={tempMinAmount}
                      onChange={(e) => setTempMinAmount(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground block mb-1">
                    {t('maxAmount')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      Rp
                    </span>
                    <Input
                      type="number"
                      value={tempMaxAmount}
                      onChange={(e) => setTempMaxAmount(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={handleApplyAmountFilter}>
                {t('applyFilter')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Payment Method */}
        <div className="w-[160px] shrink-0">
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('paymentMethod')}>
                {paymentMethod && paymentMethod !== 'ALL_METHODS' && (
                  <div className="flex items-center gap-2">
                    {
                      paymentMethods.find((m) => m.value === paymentMethod)
                        ?.icon
                    }
                    <span className="overflow-hidden text-ellipsis">
                      {paymentMethods.find((m) => m.value === paymentMethod)
                        ?.label || t('paymentMethod')}
                    </span>
                  </div>
                )}
                {paymentMethod === 'ALL_METHODS' && (
                  <span>{t('allPaymentMethods')}</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_METHODS">
                {t('allPaymentMethods')}
              </SelectItem>
              {paymentMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-shrink-0">{method.icon}</div>
                    <span>{method.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear All Filters Button */}
        <Button
          variant={hasActiveFilters ? 'destructive' : 'outline'}
          size="sm"
          onClick={handleClearAllFilters}
          disabled={!hasActiveFilters}
          className="shrink-0"
        >
          <IconFilterOff size={16} className="mr-2" />
          <span>{t('clearFilters')}</span>
        </Button>
      </div>
    </div>
  );
}
