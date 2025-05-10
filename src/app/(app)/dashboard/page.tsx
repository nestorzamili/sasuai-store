'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IconRefresh } from '@tabler/icons-react';
import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { CalendarIcon, Download, Percent } from 'lucide-react';
import { salesStatistics, metricPeformance } from './actions';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatDate, formatTime } from '@/lib/date';
import { DateFilter } from '@/lib/types/filter';
// Lazy load components for better initial load time
const SalesTrend = lazy(() =>
  import('./components/_parts/chart-sales-trend').then((mod) => ({
    default: mod.SalesTrend,
  }))
);
const TransactionTrend = lazy(() =>
  import('./components/_parts/chart-transaction-trend').then((mod) => ({
    default: mod.TransactionTrend,
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
const MemberActivities = lazy(() =>
  import('./components/_parts/member-activities').then((mod) => ({
    default: mod.MemberActivities,
  }))
);
const OverviewSales = lazy(() =>
  import('./components/overview-sales').then((mod) => ({
    default: mod.OverviewSales,
  }))
);

// Loading fallback component
const LoadingComponent = () => (
  <div className="w-full h-full bg-muted/30 animate-pulse rounded-xl border min-h-[200px]">
    Loading..
  </div>
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
  // Memoize the current date/time
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
  const [isLoading, setIsLoading] = useState(false);
  const [metricPerformance, setMetricPerformance] = useState<MetricPerformance>(
    {
      totalSales: { value: 0, growth: 0 },
      totalTransaction: { value: 0, growth: 0 },
      averageTransaction: { value: 0, growth: 0 },
      costProduct: { value: 0, growth: 0 },
      productOut: { value: 0, growth: 0 },
      margin: { value: 0, growth: 0 },
    }
  );
  const [filter, setFilter] = useState<DateFilter>({
    startDate: new Date(currentDateTime.date),
    endDate: new Date(currentDateTime.date),
  });

  const [tempFilter, setTempFilter] = useState<{
    startDate?: Date;
    endDate?: Date;
  }>({});
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fetchMetricPerformance = async () => {
    try {
      setIsLoading(true);
      const response = await metricPeformance(filter);
      // Transform the response data to match the MetricPerformance interface
      const transformedData: MetricPerformance = {
        totalSales: response?.data?.totalSales || { value: 0, growth: 0 },
        totalTransaction: response?.data?.totalTransaction || {
          value: 0,
          growth: 0,
        },
        averageTransaction: response?.data?.avgSales || { value: 0, growth: 0 },
        costProduct: response?.data?.totalCost || { value: 0, growth: 0 },
        productOut: response?.data?.profit || { value: 0, growth: 0 },
        margin: response?.data?.profit || { value: 0, growth: 0 },
      };
      // set to metric performance
      setMetricPerformance(transformedData);
      setIsLoading(false);
      return transformedData;
    } catch (error) {
      console.error('Error fetching metric performance:', error);
      setIsLoading(false);
    }
  };
  const handleRefresh = () => {
    // fetchMetricPerformance();
  };

  const filterOnChange = (date: any) => {
    setFilter({
      startDate: date.startDate,
      endDate: date.endDate,
    });
  };
  useEffect(() => {
    // Use AbortController for fetch cleanup
    const abortController = new AbortController();
    // fetchMetricPerformance();
    return () => {
      abortController.abort(); // Cancel any in-flight requests when component unmounts
    };
  }, [filter]);

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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                <CalendarIcon className="h-4 w-4" />
                <span className="mt-0.5">
                  Date Range: {formatDate(filter.startDate)} -{' '}
                  {formatDate(filter.endDate)}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Date Range</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're
                  done.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-4 py-4">
                {/* Right side: Date range inputs */}
                <div className="w-full space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      type="date"
                      id="start-date"
                      className="w-full"
                      value={
                        tempFilter?.startDate?.toISOString().split('T')[0] ||
                        filter.startDate.toISOString().split('T')[0]
                      }
                      onChange={(e) => {
                        setTempFilter({
                          ...tempFilter,
                          startDate: new Date(e.target.value),
                        });
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      type="date"
                      id="end-date"
                      className="w-full"
                      value={
                        tempFilter?.endDate?.toISOString().split('T')[0] ||
                        filter.endDate.toISOString().split('T')[0]
                      }
                      onChange={(e) => {
                        setTempFilter({
                          ...tempFilter,
                          endDate: new Date(e.target.value),
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => {
                    const startDate = tempFilter.startDate || filter.startDate;
                    const endDate = tempFilter.endDate || filter.endDate;

                    // Validate that end date is not before start date
                    if (endDate < startDate) {
                      toast({
                        title: 'Error',
                        description: 'End date cannot be before start date.',
                        variant: 'destructive',
                      });
                      return;
                    }

                    filterOnChange({
                      startDate,
                      endDate,
                    });
                    // Clear temp filter after applying
                    setTempFilter({});
                    // Close the dialog
                    setIsDialogOpen(false);
                  }}
                >
                  Apply Filter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
        <OverviewSales
          isLoading={isLoading}
          metricPerformance={metricPerformance}
        />
        {/* Main content area with more detailed analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column - 2/3 width on large screens */}
          <div className="lg:col-span-3 space-y-8">
            {/* Sales trend - prioritized as most important chart */}
            <section aria-label="Sales Trend Analysis">
              <SalesTrend />
            </section>
            {/* Transaction Analysis - Important financial data
            <section aria-label="Transaction Analysis">
              <TransactionTrend />
            </section> */}
            {/* Product and Category Analysis */}
            <section aria-label="Products and Categories">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* <PaymentMethod filter={filter} /> */}
                <SalesCategory />
                <section aria-label="Time Analysis" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Peak Sales Time</CardTitle>
                      <CardDescription>Most active time of day</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">11:00 WIB</div>
                      <p className="text-sm text-muted-foreground">
                        Highest transaction volume
                      </p>
                    </CardContent>
                  </Card>
                  {/* <MemberActivities /> */}
                </section>
                <TopSellingProduct filter={filter} />
                <TopMember />
                <TopDiscount />
                <LowProductStock />
              </div>
            </section>
          </div>
          {/* Side column - 1/3 width on large screens */}
          <div className="lg:col-span-1 space-y-8">
            {/* Top Performers Section */}
            <section aria-label="Top Performers">
              <div className="space-y-4"></div>
            </section>

            {/* Time Analysis & Recent Activity */}
          </div>
        </div>
      </div>
    </div>
  );
}
