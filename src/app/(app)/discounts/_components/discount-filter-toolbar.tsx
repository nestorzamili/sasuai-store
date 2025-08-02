'use client';

import React, { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePickerWithPresets } from '@/components/ui/date-range-picker-with-presets';

import { cn } from '@/lib/utils';
import type { DiscountFilterToolbarProps } from '@/lib/services/discount/types';

import {
  IconFilterOff,
  IconPercentage,
  IconCurrencyDollar,
  IconTag,
  IconUsers,
  IconBoxSeam,
  IconBadge,
  IconToggleLeft,
  IconToggleRight,
} from '@tabler/icons-react';

export function DiscountFilterToolbar({
  dateRange,
  setDateRange,
  type,
  setType,
  applyTo,
  setApplyTo,
  status,
  setStatus,
}: DiscountFilterToolbarProps) {
  const t = useTranslations('discount.table');
  const tFilters = useTranslations('discount.filters');

  // Determine if any filters are active - memoized for performance
  const hasActiveFilters = useMemo(
    () =>
      !!(
        dateRange ||
        type !== 'ALL_TYPES' ||
        applyTo !== 'ALL_APPLICATIONS' ||
        status !== 'ALL_STATUSES'
      ),
    [dateRange, type, applyTo, status],
  );

  // Memoize options to prevent recreation on every render
  const typeOptions = useMemo(
    () => [
      {
        value: 'PERCENTAGE',
        label: tFilters('percentage'),
        icon: <IconPercentage size={16} />,
      },
      {
        value: 'FIXED_AMOUNT',
        label: tFilters('fixedAmount'),
        icon: <IconCurrencyDollar size={16} />,
      },
    ],
    [tFilters],
  );

  // Apply to options - memoized
  const applyToOptions = useMemo(
    () => [
      {
        value: 'SPECIFIC_PRODUCTS',
        label: tFilters('specificProducts'),
        icon: <IconBoxSeam size={16} />,
      },
      {
        value: 'SPECIFIC_MEMBERS',
        label: tFilters('specificMembers'),
        icon: <IconUsers size={16} />,
      },
      {
        value: 'SPECIFIC_MEMBER_TIERS',
        label: tFilters('memberTiers'),
        icon: <IconBadge size={16} />,
      },
      {
        value: 'ALL',
        label: tFilters('allApplications'),
        icon: <IconTag size={16} />,
      },
    ],
    [tFilters],
  );

  // Status options - memoized
  const statusOptions = useMemo(
    () => [
      {
        value: 'ACTIVE',
        label: t('active'),
        icon: <IconToggleRight size={16} className="text-green-600" />,
      },
      {
        value: 'INACTIVE',
        label: t('inactive'),
        icon: <IconToggleLeft size={16} className="text-gray-500" />,
      },
    ],
    [t],
  );

  // Get display value for select components - memoized for performance
  const getTypeDisplayValue = useMemo(() => {
    if (type === 'ALL_TYPES') return tFilters('allTypes');
    const option = typeOptions.find((opt) => opt.value === type);
    return option ? (
      <div className="flex items-center gap-2">
        {option.icon}
        <span>{option.label}</span>
      </div>
    ) : (
      tFilters('allTypes')
    );
  }, [type, typeOptions, tFilters]);

  const getApplyToDisplayValue = useMemo(() => {
    if (applyTo === 'ALL_APPLICATIONS') return tFilters('allApplications');
    const option = applyToOptions.find((opt) => opt.value === applyTo);
    return option ? (
      <div className="flex items-center gap-2">
        {option.icon}
        <span>{option.label}</span>
      </div>
    ) : (
      tFilters('allApplications')
    );
  }, [applyTo, applyToOptions, tFilters]);

  const getStatusDisplayValue = useMemo(() => {
    if (status === 'ALL_STATUSES') return tFilters('allStatuses');
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? (
      <div className="flex items-center gap-2">
        {option.icon}
        <span>{option.label}</span>
      </div>
    ) : (
      tFilters('allStatuses')
    );
  }, [status, statusOptions, tFilters]);

  // Handle clearing all filters
  const handleClearAllFilters = useCallback(() => {
    setDateRange(undefined);
    setType('ALL_TYPES');
    setApplyTo('ALL_APPLICATIONS');
    setStatus('ALL_STATUSES');
  }, [setDateRange, setType, setApplyTo, setStatus]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range Picker */}
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

        {/* Discount Type Filter */}
        <div className="w-[160px] shrink-0">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger
              className={cn(
                'w-full',
                type !== 'ALL_TYPES' && 'border-primary text-primary',
              )}
            >
              <SelectValue>{getTypeDisplayValue}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_TYPES">{tFilters('allTypes')}</SelectItem>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-shrink-0">{option.icon}</div>
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Apply To Filter */}
        <div className="w-[180px] shrink-0">
          <Select value={applyTo} onValueChange={setApplyTo}>
            <SelectTrigger
              className={cn(
                'w-full',
                applyTo !== 'ALL_APPLICATIONS' && 'border-primary text-primary',
              )}
            >
              <SelectValue>{getApplyToDisplayValue}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_APPLICATIONS">
                {tFilters('allApplications')}
              </SelectItem>
              {applyToOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-shrink-0">{option.icon}</div>
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-[140px] shrink-0">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger
              className={cn(
                'w-full',
                status !== 'ALL_STATUSES' && 'border-primary text-primary',
              )}
            >
              <SelectValue>{getStatusDisplayValue}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_STATUSES">
                {tFilters('allStatuses')}
              </SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-shrink-0">{option.icon}</div>
                    <span>{option.label}</span>
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
          <span>{tFilters('clearFilters')}</span>
        </Button>
      </div>
    </div>
  );
}

// Export with React.memo for performance optimization
export default React.memo(DiscountFilterToolbar);
