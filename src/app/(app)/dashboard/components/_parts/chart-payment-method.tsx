'use client';

import { LabelList, Pie, PieChart } from 'recharts';
import { getTopPaymentMethod } from '../../actions';
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
import { useEffect, useState, useCallback } from 'react';
import { DateFilter as FilterDateFilter } from '@/lib/types/filter';

const chartConfig = {
  cash: {
    label: 'Cash',
    color: 'hsl(var(--chart-2))',
  },
  debit: {
    label: 'Debit',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

// Define interface for payment method data
interface PaymentMethodData {
  type: string;
  total: number;
  fill: string;
}

// Define props interface
interface PaymentMethodProps {
  filter?: FilterDateFilter;
}

// Define API response interface
interface PaymentMethodApiItem {
  type: string;
  total: number;
}

export function PaymentMethod({ filter }: PaymentMethodProps) {
  const [chart, setChart] = useState<PaymentMethodData[]>([
    { type: 'cash', total: 275, fill: 'var(--color-cash)' },
    { type: 'debit', total: 200, fill: 'var(--color-debit)' },
  ]);
  const [loading, setLoading] = useState(false);

  const fetchPaymentMethod = useCallback(async () => {
    try {
      setLoading(true);

      // Convert FilterDateFilter to ExtendedDateFilter format expected by the API
      // Provide default values if filter is not provided
      const defaultStart = new Date();
      defaultStart.setDate(defaultStart.getDate() - 7); // Last 7 days
      const defaultEnd = new Date();

      const apiFilter = {
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

      const response = await getTopPaymentMethod(apiFilter);
      if (response.success && response.data) {
        const formattedData = response.data.map(
          (item: PaymentMethodApiItem) => ({
            type: item.type,
            total: item.total,
            fill:
              item.type === 'cash' ? 'var(--color-cash)' : 'var(--color-debit)',
          }),
        );
        setChart(formattedData);
      }
    } catch (error) {
      console.error('Error fetching top payment methods:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]); // Include filter as dependency

  useEffect(() => {
    fetchPaymentMethod();
  }, [fetchPaymentMethod]); // Now fetchPaymentMethod is stable

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>Showing of payment method</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[250px]">
            <LoaderCardContent className="w-full h-full" />
          </div>
        ) : (
          <>
            {chart.length === 0 ? (
              <UnavailableData
                title="No Payment Method Data"
                description="No payment method data available for the selected date range."
              />
            ) : (
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
              >
                <PieChart>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="type" hideLabel />}
                  />
                  <Pie data={chart} dataKey="total">
                    <LabelList
                      dataKey="type"
                      className="fill-background"
                      stroke="none"
                      fontSize={14}
                      formatter={(value: keyof typeof chartConfig) =>
                        chartConfig[value]?.label
                      }
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
