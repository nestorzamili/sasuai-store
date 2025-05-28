import { useState, useCallback, useRef, useEffect } from 'react';
import { metricPeformance } from '../actions';
import { DateFilter as FilterDateFilter } from '@/lib/types/filter';
import { DateFilter as DashboardDateFilter } from '@/lib/types/dashboard';

export interface MetricPerformance {
  totalSales: { value: number; growth: number };
  totalTransaction: { value: number; growth: number };
  averageTransaction: { value: number; growth: number };
  costProduct: { value: number; growth: number };
  productOut: { value: number; growth: number };
  margin: { value: number; growth: number };
}

export function useMetricPerformance(filter: FilterDateFilter) {
  const [isLoading, setIsLoading] = useState(false);
  const [metricPerformance, setMetricPerformance] = useState<MetricPerformance>(
    {
      totalSales: { value: 0, growth: 0 },
      totalTransaction: { value: 0, growth: 0 },
      averageTransaction: { value: 0, growth: 0 },
      costProduct: { value: 0, growth: 0 },
      productOut: { value: 0, growth: 0 },
      margin: { value: 0, growth: 0 },
    },
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMetricPerformance = useCallback(async () => {
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);

      // Convert filter
      const dashboardFilter: DashboardDateFilter = {
        from:
          filter.from instanceof Date
            ? filter.from.toISOString().split('T')[0]
            : String(filter.from),
        to:
          filter.to instanceof Date
            ? filter.to.toISOString().split('T')[0]
            : String(filter.to),
      };

      const response = await metricPeformance(dashboardFilter);

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const transformedData: MetricPerformance = {
        totalSales: response?.data?.totalSales || { value: 0, growth: 0 },
        totalTransaction: response?.data?.totalTransaction || {
          value: 0,
          growth: 0,
        },
        averageTransaction: response?.data?.avgSales || { value: 0, growth: 0 },
        costProduct: response?.data?.totalCost || { value: 0, growth: 0 },
        productOut: response?.data?.profit || { value: 0, growth: 0 },
        margin: response?.data?.profitMargin || { value: 0, growth: 0 },
      };

      setMetricPerformance(transformedData);
      return transformedData;
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching metric performance:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  // Auto-fetch when filter changes
  useEffect(() => {
    fetchMetricPerformance();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchMetricPerformance]);

  return {
    metricPerformance,
    isLoading,
    refetch: fetchMetricPerformance,
  };
}
