'use client';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Define ChartConfig interface since the import is commented out
interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

// Add formatRupiah function
const formatRupiah = (number: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

const chartData = [
  { month: 'January', sales: 0, avg: 0, cost: 0, margin: 0 },
  { month: 'February', sales: 0, avg: 0, cost: 0, margin: 0 },
  { month: 'March', sales: 0, avg: 0, cost: 0, margin: 0 },
  { month: 'April', sales: 0, avg: 0, cost: 0, margin: 0 },
  { month: 'May', sales: 0, avg: 0, cost: 0, margin: 0 },
  { month: 'June', sales: 0, avg: 0, cost: 0, margin: 0 },
  { month: 'July', sales: 0, avg: 0, cost: 0, margin: 0 },
  { month: 'August', sales: 0, avg: 0, cost: 0, margin: 0 },
  { month: 'September', sales: 0, avg: 0, cost: 0, margin: 0 },
  { month: 'October', sales: 0, avg: 0, cost: 0, margin: 0 },
  { month: 'November', sales: 0, avg: 0, cost: 0, margin: 0 },
  { month: 'December', sales: 0, avg: 0, cost: 0, margin: 0 },
];

// Update chart config with better colors
const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--chart-3))',
  },
  avg: {
    label: 'Average',
    color: 'hsl(var(--chart-4))',
  },
  cost: {
    label: 'Cost',
    color: 'hsl(var(--chart-1))',
  },
  margin: {
    label: 'Margin',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

import { salesStatistics } from '../../actions';
import { useEffect, useState } from 'react';

// Add interfaces to properly type our data
interface SalesDataItem {
  year: number;
  month: number;
  total_transactions: number;
  total_sales: number;
  avg_sales_per_month: number;
  total_cost: number;
  margin?: number;
}

const Loading = () => {
  return (
    <div className="flex h-[300px] w-full flex-col gap-3">
      <div className="h-2.5 w-full animate-pulse rounded-full bg-muted"></div>
      <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-muted"></div>
      <div className="mt-4 h-40 w-full animate-pulse rounded-lg bg-muted"></div>
      <div className="flex gap-2 mt-4">
        <div className="h-2.5 w-1/4 animate-pulse rounded-full bg-muted"></div>
        <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-muted"></div>
        <div className="h-2.5 w-1/5 animate-pulse rounded-full bg-muted"></div>
      </div>
    </div>
  );
};

// Create a simple ChartContainer component with proper typing
const ChartContainer: React.FC<{
  children: React.ReactElement;
  config: ChartConfig;
}> = ({ children }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
};

export function SalesTrend() {
  const t = useTranslations('dashboard.charts');
  const [isLoading, setIsLoading] = useState(false);
  const [year, setYear] = useState('2025');
  const [chartDataUpdated, setChartDataUpdated] = useState(chartData);

  // fetch sales statistic
  const fetchSalesStatistic = async (year: string) => {
    try {
      setIsLoading(true);
      const response = await salesStatistics(year);
      if (response.success) {
        // Process the data for the chart after receiving it
        const updatedChartData = [...chartData];

        // Convert the object data into array format for the chart
        Object.entries(response.data || {}).forEach(([, value]) => {
          const typedValue = value as SalesDataItem; // Add type assertion here
          const monthIndex = typedValue.month - 1; // Convert to 0-based index
          if (monthIndex >= 0 && monthIndex < updatedChartData.length) {
            // Calculate margin as sales minus cost
            const margin =
              (typedValue.total_sales || 0) - (typedValue.total_cost || 0);

            updatedChartData[monthIndex] = {
              ...updatedChartData[monthIndex],
              sales: typedValue.total_sales || 0,
              avg: typedValue.avg_sales_per_month || 0,
              cost: typedValue.total_cost || 0,
              margin: margin,
            };
          }
        });

        setChartDataUpdated(updatedChartData);
      } else {
        console.error('Failed to fetch sales statistics:', response.error);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching sales statistics:', error);
    }
  };

  useEffect(() => {
    fetchSalesStatistic(year);
  }, [year]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('salesTrend')}</CardTitle>
        <CardDescription>{t('salesTrendDescription')}</CardDescription>
        <div className="flex justify-end">
          <Select disabled={isLoading} value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => (
                <SelectItem key={i} value={`${2023 + i}`}>
                  {2023 + i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loading />
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart
              data={chartDataUpdated}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <Tooltip
                formatter={(value: number, name) => [formatRupiah(value), name]}
                labelFormatter={(label) => label}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} iconType="circle" />
              <Bar
                dataKey="sales"
                name={chartConfig.sales.label}
                fill={chartConfig.sales.color}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="avg"
                name={chartConfig.avg.label}
                fill={chartConfig.avg.color}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="cost"
                name={chartConfig.cost.label}
                fill={chartConfig.cost.color}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="margin"
                name={chartConfig.margin.label}
                fill={chartConfig.margin.color}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {/* Trending up by 5.2% this month <TrendingUp className="h-4 w-4" /> */}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - December {year}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
