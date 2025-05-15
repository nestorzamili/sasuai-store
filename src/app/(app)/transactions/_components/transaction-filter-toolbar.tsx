'use client';

import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangePickerWithPresets } from '@/components/ui/date-range-picker-with-presets';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  IconCash,
  IconCreditCard,
  IconWallet,
  IconQrcode,
  IconBuildingBank,
  IconDots,
  IconFilterOff,
  IconCurrencyDollar,
} from '@tabler/icons-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/currency';

interface TransactionFilterToolbarProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  minAmount: string;
  setMinAmount: (value: string) => void;
  maxAmount: string;
  setMaxAmount: (value: string) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  onDatePresetClick: (preset: string) => void;
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

  // Payment method options
  const paymentMethods = [
    {
      value: 'ALL_METHODS',
      label: 'All Methods',
      icon: <IconDots size={16} />,
    },
    { value: 'CASH', label: 'Cash', icon: <IconCash size={16} /> },
    { value: 'DEBIT', label: 'Debit', icon: <IconCreditCard size={16} /> },
    { value: 'E_WALLET', label: 'E-Wallet', icon: <IconWallet size={16} /> },
    { value: 'QRIS', label: 'QRIS', icon: <IconQrcode size={16} /> },
    {
      value: 'TRANSFER',
      label: 'Transfer',
      icon: <IconBuildingBank size={16} />,
    },
    { value: 'OTHER', label: 'Other', icon: <IconDots size={16} /> },
  ];

  // Update temporary amount values when main values change
  useEffect(() => {
    setTempMinAmount(minAmount);
    setTempMaxAmount(maxAmount);
  }, [minAmount, maxAmount]);

  // Generate amount button label
  const getAmountButtonLabel = () => {
    if (minAmount && maxAmount) {
      return `${formatRupiah(minAmount)} - ${formatRupiah(maxAmount)}`;
    } else if (minAmount) {
      return `Min: ${formatRupiah(minAmount)}`;
    } else if (maxAmount) {
      return `Max: ${formatRupiah(maxAmount)}`;
    }
    return 'Amount Range';
  };

  // Handle amount filter apply
  const handleApplyAmountFilter = () => {
    setMinAmount(tempMinAmount);
    setMaxAmount(tempMaxAmount);
    setAmountOpen(false);
  };

  // Reset amount filter
  const handleResetAmountFilter = () => {
    setTempMinAmount('');
    setTempMaxAmount('');
    setMinAmount('');
    setMaxAmount('');
    setAmountOpen(false);
  };

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    setDateRange(undefined);
    setMinAmount('');
    setMaxAmount('');
    setPaymentMethod('ALL_METHODS');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range Picker with compact display */}
        <div className="w-[200px]">
          <DateRangePickerWithPresets
            value={dateRange}
            onChange={setDateRange}
            align="start"
            className="w-full"
            isCompact={true}
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
                <h4 className="font-medium">Amount Range</h4>
                {(tempMinAmount || tempMaxAmount) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetAmountFilter}
                    className="h-7 px-2 text-xs"
                  >
                    Reset
                  </Button>
                )}
              </div>

              {/* Amount Input Fields */}
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground block mb-1">
                    Min Amount
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
                    Max Amount
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
                Apply Filter
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Payment Method */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-[160px] shrink-0">
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Payment Method">
                      {paymentMethod && (
                        <div className="flex items-center gap-2">
                          {
                            paymentMethods.find(
                              (m) => m.value === paymentMethod,
                            )?.icon
                          }
                          <span className="overflow-hidden text-ellipsis">
                            {paymentMethods.find(
                              (m) => m.value === paymentMethod,
                            )?.label || 'Payment Method'}
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
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
            </TooltipTrigger>
            <TooltipContent>
              {paymentMethods.find((m) => m.value === paymentMethod)?.label ||
                'Payment Method'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Clear All Filters Button */}
        <Button
          variant={hasActiveFilters ? 'destructive' : 'outline'}
          size="sm"
          onClick={handleClearAllFilters}
          disabled={!hasActiveFilters}
          className="shrink-0"
        >
          <IconFilterOff size={16} className="mr-2" />
          <span>Clear Filters</span>
        </Button>
      </div>
    </div>
  );
}
