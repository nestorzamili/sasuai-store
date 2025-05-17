'use client';

import { TrendingUp } from 'lucide-react';
import { LabelList, Pie, PieChart } from 'recharts';
import { getTopCategories } from '../../actions';
import { UnavailableData } from '@/components/unavailable-data';
import { LoaderCardContent } from '@/components/loader-card-content';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useEffect, useState, useMemo } from 'react';

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

export function SalesCategory(filter?: any) {
  const [chartData, setChartData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(false);

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

  const fetchTopCategories = async () => {
    try {
      setLoading(true);
      const response = await getTopCategories(filter);
      if (response.success && response.data) {
        const formattedData = response.data.map(
          (
            item: { categoryName: string; transactionCount: number },
            index: number
          ) => ({
            browser: item.categoryName, // Using browser key for consistency with chart component
            visitors: item.transactionCount, // Using visitors key for consistency with chart component
            fill: categoryColors[index % categoryColors.length],
            label: item.categoryName, // Add label field for tooltip
          })
        );
        setChartData(formattedData);
      } else {
        console.log('dari fetch data', response);
        setChartData([]);
      }
    } catch (error) {
      console.error('Error fetching top categories:', error);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopCategories();
  }, [filter]);

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
