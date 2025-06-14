'use client';
import { Button } from '@/components/ui/button';
// Removed unused card components
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
import { IconRefresh } from '@tabler/icons-react';
import { useState, useMemo, lazy, useCallback, Suspense } from 'react';
import { Download } from 'lucide-react';
import { useMetricPerformance } from './hooks/useMetricPerformance';
import { formatDate } from '@/lib/date';
import { DateFilter as FilterDateFilter } from '@/lib/types/filter';
import { DateRangePickerWithPresets } from '@/components/ui/date-range-picker-with-presets';

// Lazy load components for better initial load time
const SalesTrend = lazy(() =>
  import('./components/_parts/chart-sales-trend').then((mod) => ({
    default: mod.SalesTrend,
  }))
);
const PaymentMethod = lazy(() =>
  import('./components/_parts/chart-payment-method').then((mod) => ({
    default: mod.PaymentMethod,
  }))
);
const SalesCategory = lazy(() =>
  import('./components/_parts/chart-sales-category').then((mod) => ({
    default: mod.SalesCategory,
  }))
);
const TopSellingProduct = lazy(() =>
  import('./components/_parts/top-selling-product').then((mod) => ({
    default: mod.TopSellingProduct,
  }))
);
const TopDiscount = lazy(() =>
  import('./components/_parts/top-discount').then((mod) => ({
    default: mod.TopDiscount,
  }))
);
const TopMember = lazy(() =>
  import('./components/_parts/top-member').then((mod) => ({
    default: mod.TopMember,
  }))
);
const LowProductStock = lazy(() =>
  import('./components/_parts/low-product-stock').then((mod) => ({
    default: mod.LowProductStock,
  }))
);
const OverviewSales = lazy(() =>
  import('./components/overview-sales').then((mod) => ({
    default: mod.OverviewSales,
  }))
);

export interface MetricPerformance {
  totalSales: MetricPerformanceStat;
  totalTransaction: MetricPerformanceStat;
  averageTransaction: MetricPerformanceStat;
  costProduct: MetricPerformanceStat;
  productOut: MetricPerformanceStat;
  margin: MetricPerformanceStat;
}

export interface MetricPerformanceStat {
  value: number | 0;
  growth: number | 0;
}

export default function Dashboard() {
  // Memoize the current date/time to prevent re-calculations
  const currentDateTime = useMemo(() => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }),
      time:
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }) + ' WIB',
    };
  }, []);

  const [filter, setFilter] = useState<FilterDateFilter>(() => ({
    from: new Date(currentDateTime.date),
    to: new Date(currentDateTime.date),
  }));

  // Use custom hook
  const { metricPerformance, isLoading, refetch } =
    useMetricPerformance(filter);

  // Memoize handlers to prevent unnecessary re-renders
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleFilterChange = useCallback(
    (val: { from?: Date; to?: Date } | undefined) => {
      if (val?.from && val?.to) {
        setFilter({
          from: val.from,
          to: val.to,
        });
      }
    },
    []
  );

  // Memoize the filter object passed to components
  const memoizedFilter = useMemo(() => filter, [filter]);

  // Memoize the loading component
  const LoadingFallback = useMemo(
    () => (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
    []
  );

  return (
    <div className="space-y-6 relative">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time performance insights for your business
          </p>
          <div className="mt-1 flex flex-col  text-muted-foreground">
            <span>
              Current: {formatDate(currentDateTime.date)} |{' '}
              {currentDateTime.time}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <DateRangePickerWithPresets
            value={{ from: new Date(filter.from), to: new Date(filter.to) }}
            onChange={handleFilterChange}
          />
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Performance Metrics</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="h-9 gap-2"
        >
          <IconRefresh
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
        </Button>
      </div>
      <div className="space-y-8 transition-opacity duration-300 ease-in-out">
        {/* High-level Key Performance Indicators */}
        <Suspense fallback={LoadingFallback}>
          <OverviewSales
            isLoading={isLoading}
            metricPerformance={metricPerformance}
          />
        </Suspense>
        {/* Main content area with more detailed analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column - 2/3 width on large screens */}
          <div className="lg:col-span-3 space-y-8">
            {/* Sales trend - prioritized as most important chart */}
            <section aria-label="Sales Trend Analysis">
              <Suspense fallback={LoadingFallback}>
                <SalesTrend />
              </Suspense>
            </section>
            {/* Product and Category Analysis */}
            <section aria-label="Products and Categories">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Suspense fallback={LoadingFallback}>
                  <PaymentMethod filter={memoizedFilter} />
                </Suspense>
                <Suspense fallback={LoadingFallback}>
                  <SalesCategory filter={memoizedFilter} />
                </Suspense>
                <Suspense fallback={LoadingFallback}>
                  <TopSellingProduct filter={memoizedFilter} />
                </Suspense>{' '}
                <Suspense fallback={LoadingFallback}>
                  <TopMember filter={memoizedFilter} />
                </Suspense>{' '}
                <Suspense fallback={LoadingFallback}>
                  <TopDiscount filter={memoizedFilter} />
                </Suspense>
                <Suspense fallback={LoadingFallback}>
                  <LowProductStock />
                </Suspense>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
