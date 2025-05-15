'use client';

import { useState, useEffect } from 'react';
import { IconFilterOff, IconCurrencyDollar } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getProductFormOptions } from '../action';
import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/currency';

interface ProductFilterToolbarProps {
  status: string;
  setStatus: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  brandId: string;
  setBrandId: (value: string) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
}

export default function ProductFilterToolbar({
  status,
  setStatus,
  categoryId,
  setCategoryId,
  setBrandId, // Keep this for compatibility
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
}: ProductFilterToolbarProps) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [priceOpen, setPriceOpen] = useState(false);
  const [tempMinPrice, setTempMinPrice] = useState(minPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState(maxPrice);

  // Determine if any filters are active
  const hasActiveFilters =
    status !== 'all' || categoryId !== 'all' || minPrice || maxPrice;

  // Handle price filter apply
  const handleApplyPriceFilter = () => {
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setPriceOpen(false);
  };

  // Reset price filter
  const handleResetPriceFilter = () => {
    setTempMinPrice('');
    setTempMaxPrice('');
    setMinPrice('');
    setMaxPrice('');
    setPriceOpen(false);
  };

  // Generate price button label
  const getPriceButtonLabel = () => {
    if (minPrice && maxPrice) {
      return `${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)}`;
    } else if (minPrice) {
      return `Min: ${formatRupiah(minPrice)}`;
    } else if (maxPrice) {
      return `Max: ${formatRupiah(maxPrice)}`;
    }
    return 'Price Range';
  };

  // Update temporary price values when main values change
  useEffect(() => {
    setTempMinPrice(minPrice);
    setTempMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        const result = await getProductFormOptions();
        if (result.success && result.data) {
          setCategories(result.data.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    setStatus('all');
    setCategoryId('all');
    setBrandId('all'); // Keep this for compatibility
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Filter */}
      <Select value={status} onValueChange={setStatus} disabled={isLoading}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Category Filter */}
      <Select
        value={categoryId}
        onValueChange={setCategoryId}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Price Range Filter with Popover */}
      <Popover open={priceOpen} onOpenChange={setPriceOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[180px] justify-between gap-2',
              (minPrice || maxPrice) && 'border-primary text-primary',
            )}
          >
            <IconCurrencyDollar size={18} />
            <span className="truncate">{getPriceButtonLabel()}</span>
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
              <h4 className="font-medium">Price Range</h4>
              {(tempMinPrice || tempMaxPrice) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetPriceFilter}
                  className="h-7 px-2 text-xs"
                >
                  Reset
                </Button>
              )}
            </div>

            {/* Price Input Fields */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground block mb-1">
                  Min Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    type="number"
                    value={tempMinPrice}
                    onChange={(e) => setTempMinPrice(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground block mb-1">
                  Max Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    type="number"
                    value={tempMaxPrice}
                    onChange={(e) => setTempMaxPrice(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            <Button className="w-full" onClick={handleApplyPriceFilter}>
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
      >
        <IconFilterOff size={16} className="mr-2" />
        <span>Clear Filters</span>
      </Button>
    </div>
  );
}
