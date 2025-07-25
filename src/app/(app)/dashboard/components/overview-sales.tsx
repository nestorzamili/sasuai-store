import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import {
  IconCash,
  IconCoin,
  IconPercentage,
  IconReceipt2,
  IconScale,
} from '@tabler/icons-react';
import { MetricPerformance } from '../page';
import { ValuesMetric } from './metrics-component';
import { formatRupiah } from '@/lib/currency';

interface OverviewSalesProps {
  isLoading: boolean;
  metricPerformance: MetricPerformance;
}

export function OverviewSales({
  isLoading,
  metricPerformance,
}: OverviewSalesProps) {
  const t = useTranslations('dashboard.metrics');
  const tCommon = useTranslations('dashboard');

  const {
    totalSales,
    totalTransaction,
    averageTransaction,
    costProduct,
    margin,
  } = metricPerformance;

  return (
    <>
      {/* Stats cards to match dashboard style */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalSales')}
            </CardTitle>
            <IconCash className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-8 w-full max-w-[120px] bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="h-4 w-full max-w-[160px] bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-700">
                  {formatRupiah(totalSales.value)}
                </div>
                <div className="text-xs text-muted-foreground flex w-full items-center gap-2 mt-4">
                  <ValuesMetric value={totalSales.growth} />{' '}
                  {tCommon('fromLastPeriod')}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className=" shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalTransaction')}
            </CardTitle>
            <IconReceipt2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-8 w-full max-w-[120px] bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="h-4 w-full max-w-[160px] bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-700">
                  {totalTransaction.value.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground flex w-full items-center gap-2 mt-4">
                  <ValuesMetric value={totalTransaction.growth} />{' '}
                  {tCommon('fromLastPeriod')}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('averageTransaction')}
            </CardTitle>
            <IconScale className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-8 w-full max-w-[120px] bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="h-4 w-full max-w-[160px] bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-700">
                  {formatRupiah(averageTransaction.value)}
                </div>
                <div className="text-xs text-muted-foreground flex w-full items-center gap-2 mt-4">
                  <ValuesMetric value={averageTransaction.growth} />{' '}
                  {tCommon('fromLastPeriod')}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('costProduct')}
            </CardTitle>
            <IconCoin className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-8 w-full max-w-[120px] bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="h-4 w-full max-w-[160px] bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-700">
                  {formatRupiah(costProduct.value)}
                </div>
                <div className="text-xs text-muted-foreground flex w-full items-center gap-2 mt-4">
                  <ValuesMetric value={costProduct.growth} />{' '}
                  {tCommon('fromLastPeriod')}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('margin')}</CardTitle>
            <IconPercentage className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-8 w-full max-w-[120px] bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="h-4 w-full max-w-[160px] bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-700">
                  {formatRupiah(margin.value)}
                </div>
                <div className="text-xs text-muted-foreground flex w-full items-center gap-2 mt-4">
                  <ValuesMetric value={margin.growth} />{' '}
                  {tCommon('fromLastPeriod')}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
