'use client';

import { LabelList, Pie, PieChart } from 'recharts';
import { getTopCategories } from '../../actions';
import { UnavailableData } from '@/components/unavailable-data';
import { LoaderCardContent } from '@/components/loader-card-content';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { DateFilter as FilterDateFilter } from '@/lib/types/filter';

// Basic chart config with just the visitors key
const baseChartConfig = {
  visitors: {
    label: 'Transactions',
  },
} as ChartConfig;

// Colors for chart segments
const categoryColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
];

// Define interface for category data
interface CategoryData {
  browser: string;
  visitors: number;
  fill: string;
  label: string;
}

// Define props interface
interface SalesCategoryProps {
  filter?: FilterDateFilter;
}

// Define API response interface
interface CategoryApiItem {
  categoryName: string;
  transactionCount: number;
}

export function SalesCategory({ filter }: SalesCategoryProps) {
  const [chartData, setChartData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Dynamically generate chart config based on current data
  const chartConfig = useMemo(() => {
    const config = { ...baseChartConfig };

    chartData.forEach((item, index) => {
      config[item.browser] = {
        label: item.browser,
        color: categoryColors[index % categoryColors.length],
      };
    });

    return config;
  }, [chartData]);

  // Memoize the API filter to prevent unnecessary recreations
  const apiFilter = useMemo(() => {
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 7);
    const defaultEnd = new Date();

    return {
      filter: {
        from:
          filter?.from instanceof Date
            ? filter.from.toISOString().split('T')[0]
            : filter?.from
              ? String(filter.from)
              : defaultStart.toISOString().split('T')[0],
        to:
          filter?.to instanceof Date
            ? filter.to.toISOString().split('T')[0]
            : filter?.to
              ? String(filter.to)
              : defaultEnd.toISOString().split('T')[0],
      },
    };
  }, [filter?.from, filter?.to]);

  const fetchTopCategories = useCallback(async () => {
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);

      const response = await getTopCategories(apiFilter);

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (response.success && response.data) {
        const formattedData = response.data.map(
          (item: CategoryApiItem, index: number) => ({
            browser: item.categoryName,
            visitors: item.transactionCount,
            fill: categoryColors[index % categoryColors.length],
            label: item.categoryName,
          }),
        );
        setChartData(formattedData);
      } else {
        setChartData([]);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching top categories:', error);
      }
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [apiFilter]);

  useEffect(() => {
    fetchTopCategories();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTopCategories]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-2">
        <CardTitle>Sales by Category</CardTitle>
        <CardDescription className="text-muted-foreground">
          Top categories by transaction count
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[250px]">
            <LoaderCardContent className="w-full h-full" />
          </div>
        ) : (
          <>
            {chartData.length === 0 ? (
              <UnavailableData
                title="No Category Data"
                description="No category data available for the selected date range."
              />
            ) : (
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent nameKey="browser" hideLabel />
                    }
                  />
                  <Pie data={chartData} dataKey="visitors">
                    <LabelList
                      dataKey="browser"
                      className="fill-background"
                      stroke="none"
                      fontSize={12}
                      formatter={(value: string) => {
                        // Short label for display inside chart
                        if (value.length > 12) {
                          return value.slice(0, 10) + '...';
                        }
                        return value;
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
