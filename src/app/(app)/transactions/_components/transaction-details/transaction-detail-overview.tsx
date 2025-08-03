'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatRupiah } from '@/lib/currency';
import { ShoppingCart, Tag, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import type { TransactionDetails } from '@/lib/services/transaction/types';

interface TransactionDetailOverviewProps {
  transaction: TransactionDetails;
}

export function TransactionDetailOverview({
  transaction,
}: TransactionDetailOverviewProps) {
  const t = useTranslations('transaction.detailDialog');
  const pricing = transaction?.pricing;
  const payment = transaction?.payment;

  // Use data provided by service instead of manual calculation
  const originalTotal = pricing?.originalAmount || 0;
  const transactionDiscount = pricing?.discounts?.amount || 0;
  const totalDiscounts = pricing?.discounts?.total || 0;
  const finalAmount = pricing?.finalAmount || 0;

  // Calculate product-level discounts from total discounts
  const productDiscounts = totalDiscounts - transactionDiscount;

  const createdAt = new Date(transaction.createdAt);

  return (
    <div className="space-y-4">
      {/* Basic Information Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4" />
            {t('basicInformation')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('transactionId')}</span>
            <span className="font-mono text-sm">{transaction.tranId}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('date')}</span>
            <span className="text-sm">{format(createdAt, 'dd MMM yyyy')}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('time')}</span>
            <span className="text-sm">{format(createdAt, 'HH:mm:ss')}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('cashier')}</span>
            <span className="text-sm">{transaction.cashier.name}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('totalItems')}</span>
            <span className="text-sm">{transaction.items?.length || 0}</span>
          </div>

          {/* Member Information */}
          {transaction.member ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('memberName')}</span>
                <span className="text-sm">{transaction.member.name}</span>
              </div>

              {transaction.member.tier && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t('memberTier')}
                  </span>
                  <Badge variant="outline">{transaction.member.tier}</Badge>
                </div>
              )}

              {/* Points Earned - only show if member exists and points > 0 */}
              {transaction.member && transaction.pointsEarned > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t('pointsEarned')}
                  </span>
                  <Badge variant="default" className="bg-primary">
                    +{transaction.pointsEarned} {t('points')}
                  </Badge>
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('member')}</span>
              <span className="text-sm text-muted-foreground">
                {t('walkInCustomer')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4" />
            {t('purchaseSummary')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Original Total */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('originalTotal')}</span>
            <span className="font-medium">{formatRupiah(originalTotal)}</span>
          </div>

          {/* Product Discounts */}
          {productDiscounts > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  {t('productDiscounts')}
                </span>
              </div>
              <span className="text-rose-600 font-medium">
                -{formatRupiah(productDiscounts)}
              </span>
            </div>
          )}

          {/* Transaction-level Discount */}
          {transactionDiscount > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm">
                    {pricing?.discounts?.isGlobal
                      ? t('globalDiscount')
                      : t('memberDiscount')}
                  </span>
                  {pricing?.discounts?.code && (
                    <Badge variant="outline" className="text-xs w-fit mt-1">
                      {pricing.discounts.code}
                    </Badge>
                  )}
                </div>
              </div>
              <span className="text-rose-600 font-medium">
                -{formatRupiah(transactionDiscount)}
              </span>
            </div>
          )}

          {/* Total Discounts */}
          {totalDiscounts > 0 && (
            <>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">
                  {t('totalDiscounts')}
                </span>
                <span className="text-rose-600 font-semibold">
                  -{formatRupiah(totalDiscounts)}
                </span>
              </div>
            </>
          )}

          <Separator />

          {/* Final Amount */}
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">{t('finalAmount')}</span>
            <span className="font-bold text-primary">
              {formatRupiah(finalAmount)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information Card */}
      {payment && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              {t('paymentInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Payment Method */}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t('paymentMethod')}
              </span>
              <Badge variant="secondary" className="capitalize">
                {payment.method?.toLowerCase() || 'Unknown'}
              </Badge>
            </div>

            {/* Payment Amount */}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t('paymentAmount')}
              </span>
              <span className="font-medium">
                {formatRupiah(payment?.amount || pricing?.finalAmount || 0)}
              </span>
            </div>

            {/* Change Amount (if applicable) */}
            {(payment?.method === 'CASH' ||
              (payment?.change !== null && payment?.change > 0)) && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {t('changeAmount')}
                </span>
                <span className="font-medium text-green-600">
                  {formatRupiah(payment?.change || 0)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
