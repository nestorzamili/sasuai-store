'use client';

import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangePickerWithPresets } from '@/components/ui/date-range-picker-with-presets';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconBox, IconFilterOff } from '@tabler/icons-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface BatchFilterToolbarProps {
  expiryDateRange: DateRange | undefined;
  setExpiryDateRange: (range: DateRange | undefined) => void;
  minQuantity: string;
  setMinQuantity: (value: string) => void;
  maxQuantity: string;
  setMaxQuantity: (value: string) => void;
}

export default function BatchFilterToolbar({
  expiryDateRange,
  setExpiryDateRange,
  minQuantity,
  setMinQuantity,
  maxQuantity,
  setMaxQuantity,
}: BatchFilterToolbarProps) {
  // State for the quantity popover
  const [qtyOpen, setQtyOpen] = useState(false);
  const [tempMinQty, setTempMinQty] = useState(minQuantity);
  const [tempMaxQty, setTempMaxQty] = useState(maxQuantity);

  // Determine if any filters are active
  const hasActiveFilters = !!(expiryDateRange || minQuantity || maxQuantity);

  // Update temporary quantity values when main values change
  useEffect(() => {
    setTempMinQty(minQuantity);
    setTempMaxQty(maxQuantity);
  }, [minQuantity, maxQuantity]);

  // Generate quantity button label
  const getQtyButtonLabel = () => {
    if (minQuantity && maxQuantity) {
      return `${minQuantity} - ${maxQuantity} units`;
    } else if (minQuantity) {
      return `Min: ${minQuantity} units`;
    } else if (maxQuantity) {
      return `Max: ${maxQuantity} units`;
    }
    return 'Quantity Range';
  };

  // Handle quantity filter apply
  const handleApplyQtyFilter = () => {
    setMinQuantity(tempMinQty);
    setMaxQuantity(tempMaxQty);
    setQtyOpen(false);
  };

  // Reset quantity filter
  const handleResetQtyFilter = () => {
    setTempMinQty('');
    setTempMaxQty('');
    setMinQuantity('');
    setMaxQuantity('');
    setQtyOpen(false);
  };

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    setExpiryDateRange(undefined);
    setMinQuantity('');
    setMaxQuantity('');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {/* Expiry Date Range Picker */}
        <div className="w-[200px]">
          <DateRangePickerWithPresets
            value={expiryDateRange}
            onChange={setExpiryDateRange}
            align="start"
            className="w-full"
            isCompact={true}
          />
        </div>

        {/* Quantity Range - Using Popover */}
        <Popover open={qtyOpen} onOpenChange={setQtyOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[180px] justify-between gap-2',
                (minQuantity || maxQuantity) && 'border-primary text-primary',
              )}
            >
              <IconBox size={18} />
              <span className="truncate">{getQtyButtonLabel()}</span>
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
                <h4 className="font-medium">Quantity Range</h4>
                {(tempMinQty || tempMaxQty) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetQtyFilter}
                    className="h-7 px-2 text-xs"
                  >
                    Reset
                  </Button>
                )}
              </div>

              {/* Quantity Input Fields */}
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground block mb-1">
                    Min Quantity
                  </label>
                  <Input
                    type="number"
                    value={tempMinQty}
                    onChange={(e) => setTempMinQty(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground block mb-1">
                    Max Quantity
                  </label>
                  <Input
                    type="number"
                    value={tempMaxQty}
                    onChange={(e) => setTempMaxQty(e.target.value)}
                  />
                </div>
              </div>

              <Button className="w-full" onClick={handleApplyQtyFilter}>
                Apply Filter
              </Button>
            </div>
          </PopoverContent>
        </Popover>

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
