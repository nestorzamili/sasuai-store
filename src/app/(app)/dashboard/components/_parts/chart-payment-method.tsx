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
import { useEffect, useState } from 'react';

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

export function PaymentMethod(filter?: any) {
  const [chart, setChart] = useState<PaymentMethodData[]>([
    { type: 'cash', total: 275, fill: 'var(--color-cash)' },
    { type: 'debit', total: 200, fill: 'var(--color-debit)' },
  ]);
  const [loading, setLoading] = useState(false);

  const fetchPaymentMethod = async () => {
    try {
      setLoading(true);
      const response = await getTopPaymentMethod(filter);
      if (response.success && response.data) {
        const formattedData = response.data.map(
          (item: { type: string; total: number }) => ({
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
  };

  useEffect(() => {
    fetchPaymentMethod();
  }, [filter]);

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
