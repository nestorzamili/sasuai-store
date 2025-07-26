import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { format, isAfter } from 'date-fns';
import { getTopDiscounts } from '../../actions';
import { DateFilter as FilterDateFilter } from '@/lib/types/filter';
import { TopDiscountData } from '@/lib/types/dashboard';
import { LoaderCardContent } from '@/components/loader-card-content';
import { UnavailableData } from '@/components/unavailable-data';
import { DiscountType } from '@/lib/types/discount';

interface TopDiscountProps {
  filter?: FilterDateFilter;
}

export function TopDiscount({ filter }: TopDiscountProps) {
  const t = useTranslations('dashboard.charts');
  const [discounts, setDiscounts] = useState<TopDiscountData[]>([]);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format discount value based on type
  const formatDiscountValue = (value: number, type: string): string => {
    if (type === DiscountType.PERCENTAGE) {
      return `${value}%`;
    } else {
      return formatCurrency(value);
    }
  };

  // Memoize the API filter to prevent unnecessary recreations
  const apiFilter = useMemo(() => {
    const defaultStart = new Date();
    defaultStart.setDate(1); // First day of current month
    const defaultEnd = new Date();
    const lastDay = new Date(
      defaultEnd.getFullYear(),
      defaultEnd.getMonth() + 1,
      0
    ).getDate();
    defaultEnd.setDate(lastDay); // Last day of current month

    return {
      filter: {
        from:
          filter?.from instanceof Date
            ? format(filter.from, 'yyyy-MM-dd')
            : filter?.from
              ? String(filter.from)
              : format(defaultStart, 'yyyy-MM-dd'),
        to:
          filter?.to instanceof Date
            ? format(filter.to, 'yyyy-MM-dd')
            : filter?.to
              ? String(filter.to)
              : format(defaultEnd, 'yyyy-MM-dd'),
      },
    };
  }, [filter?.from, filter?.to]);

  const fetchTopDiscounts = useCallback(async () => {
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);

      const response = await getTopDiscounts(apiFilter);

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (response.success && response.data) {
        setDiscounts(response.data);
      } else {
        setDiscounts([]);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching top discounts:', error);
      }
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  }, [apiFilter]);

  useEffect(() => {
    fetchTopDiscounts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTopDiscounts]);
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          {t('topDiscount')}
        </CardTitle>
        <CardDescription>{t('topDiscountDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-0 pb-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[250px]">
            <LoaderCardContent className="w-full h-full" />
          </div>
        ) : discounts.length === 0 ? (
          <UnavailableData
            title="No Discount Data"
            description="No discounts have been used in the selected period."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promotion</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead className="text-right">Revenue Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((discount) => {
                // Check if discount is active by checking end date and isActive flag
                const isExpired =
                  !discount.isActive ||
                  isAfter(new Date(), new Date(discount.endDate));

                // Calculate usage percentage for the progress bar
                const usagePercent =
                  discount.usagePercent ||
                  (discount.maxUses
                    ? Math.min(
                        100,
                        Math.round(
                          (discount.usageCount / discount.maxUses) * 100
                        )
                      )
                    : 50);

                return (
                  <TableRow key={discount.id}>
                    <TableCell>
                      <div className="font-medium">{discount.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {discount.code ? (
                          <code className="bg-muted px-1 py-0.5 rounded">
                            {discount.code}
                          </code>
                        ) : (
                          <span className="text-muted-foreground italic">
                            No code
                          </span>
                        )}
                        <span>
                          {formatDiscountValue(discount.value, discount.type)}{' '}
                          off
                        </span>
                        {isExpired && (
                          <Badge
                            variant="outline"
                            className="bg-muted text-muted-foreground"
                          >
                            Expired
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          {discount.usageCount} uses
                        </span>
                        {discount.maxUses && (
                          <span className="text-xs font-medium">
                            {usagePercent}%
                          </span>
                        )}
                      </div>
                      <Progress
                        value={usagePercent}
                        className="h-2"
                        color={
                          usagePercent > 80
                            ? 'green'
                            : usagePercent > 50
                              ? 'blue'
                              : 'gray'
                        }
                      />
                      {discount.maxUses && (
                        <div className="text-xs text-muted-foreground text-right mt-1">
                          of max {discount.maxUses}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(discount.totalRevenueImpact)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
