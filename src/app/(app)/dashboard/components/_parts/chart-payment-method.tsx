'use client';

import { TrendingUp } from 'lucide-react';
import { LabelList, Pie, PieChart } from 'recharts';
import { getTopPaymentMethod } from '../../actions';
import { DateFilter } from '@/lib/types/filter';
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

export function PaymentMethod(filter?: DateFilter) {
  const [chart, setChart] = useState([
    { type: 'cash', total: 275, fill: 'var(--color-cash)' },
    { type: 'debit', total: 200, fill: 'var(--color-debit)' },
  ]);
  const fetchPaymentMethod = async () => {
    try {
      const response = await getTopPaymentMethod(filter);
      if (response.success && response.data) {
        const formattedData = response.data.map((item: any) => ({
          type: item.type,
          total: item.total,
          fill:
            item.type === 'cash' ? 'var(--color-cash)' : 'var(--color-debit)',
        }));
        setChart(formattedData);
      }
    } catch (error) {
      console.error('Error fetching top payment methods:', error);
    }
  };
  useEffect(() => {
    fetchPaymentMethod();
  }, [filter]);
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>Filter Date</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
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
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-medium">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: 'var(--color-cash)' }}
              ></span>
              <span>
                Cash: {chart.find((item) => item.type === 'cash')?.total || 0}
              </span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: 'var(--color-debit)' }}
              ></span>
              <span>
                Debit: {chart.find((item) => item.type === 'debit')?.total || 0}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 font-medium leading-none">
              <TrendingUp className="h-4 w-4" />
              Total: {chart.reduce((sum, item) => sum + item.total, 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Based on recent transactions
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
