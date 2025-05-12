'use client';

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
} from '@tabler/icons-react';

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

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    setDateRange(undefined);
    setMinAmount('');
    setMaxAmount('');
    setPaymentMethod('ALL_METHODS');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Amount Range - Direct inputs instead of popover */}
        <div className="flex items-center gap-2 min-w-[180px] shrink-0">
          <Input
            placeholder="Min Amount"
            className="w-[150px] h-9"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            placeholder="Max Amount"
            className="w-[150px] h-9"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </div>

        {/* Payment Method - Updated to display icons */}
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

        {/* Date Range Picker with Presets - Fixed width with more space */}
        <div className="w-[220px] shrink-0">
          <DateRangePickerWithPresets
            value={dateRange}
            onChange={setDateRange}
            align="start"
            className="w-full"
          />
        </div>

        {/* Clear All Filters Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleClearAllFilters}
          title="Clear all filters"
          className="h-9 w-9 shrink-0 ml-4"
        >
          <IconFilterOff size={16} />
        </Button>
      </div>
    </div>
  );
}
