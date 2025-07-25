'use client';

import { LabelList, Pie, PieChart } from 'recharts';
import { useTranslations } from 'next-intl';
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
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
  const t = useTranslations('dashboard.charts');
  const [chart, setChart] = useState<PaymentMethodData[]>([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  const fetchPaymentMethod = useCallback(async () => {
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);

      const response = await getTopPaymentMethod(apiFilter);

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (response.success && response.data) {
        const formattedData = response.data.map(
          (item: PaymentMethodApiItem) => ({
            type: item.type,
            total: item.total,
            fill:
              item.type === 'cash' ? 'var(--color-cash)' : 'var(--color-debit)',
          })
        );
        setChart(formattedData);
      } else {
        setChart([]);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching top payment methods:', error);
      }
      setChart([]);
    } finally {
      setLoading(false);
    }
  }, [apiFilter]);

  useEffect(() => {
    fetchPaymentMethod();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPaymentMethod]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{t('paymentMethod')}</CardTitle>
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
                title={t('noPaymentMethodData')}
                description={t('noPaymentMethodDescription')}
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
