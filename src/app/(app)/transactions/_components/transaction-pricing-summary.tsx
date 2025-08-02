import { Separator } from '@/components/ui/separator';
import { formatRupiah } from '@/lib/currency';
import { useTranslations } from 'next-intl';
import type { TransactionDetails } from '@/lib/services/transaction/types';

interface TransactionPricingSummaryProps {
  transaction: TransactionDetails;
}

export function TransactionPricingSummary({
  transaction,
}: TransactionPricingSummaryProps) {
  const t = useTranslations('transaction.detailDialog');
  const pricing = transaction?.pricing;
  const payment = transaction?.payment;

  return (
    <div className="space-y-3">
      <h4 className="font-medium">{t('summary')}</h4>

      <div className="flex justify-between">
        <span className="text-muted-foreground">{t('totalAmount')}</span>
        <span>{formatRupiah(pricing?.originalAmount || 0)}</span>
      </div>

      {pricing?.discounts?.id && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {pricing.discounts.isGlobal
              ? pricing.discounts.code
                ? `${t('globalDiscount')} (${pricing.discounts.code})`
                : t('globalDiscount')
              : t('memberDiscount')}
          </span>
          <span className="text-rose-600">
            -{formatRupiah(pricing.discounts.amount || 0)}
          </span>
        </div>
      )}

      <div className="flex justify-between">
        <span className="text-muted-foreground">{t('discountAmount')}</span>
        <span className="text-rose-600">
          -{formatRupiah(pricing?.discounts?.total || 0)}
        </span>
      </div>

      <Separator />

      <div className="flex justify-between text-lg font-bold">
        <span>{t('finalAmount')}</span>
        <span>{formatRupiah(pricing?.finalAmount || 0)}</span>
      </div>

      {/* Payment Information */}
      {payment && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('paymentAmount')}</span>
            <span className="font-medium">
              {formatRupiah(payment?.amount || pricing?.finalAmount || 0)}
            </span>
          </div>

          {(payment?.method === 'CASH' ||
            (payment?.change !== null && payment?.change > 0)) && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('changeAmount')}</span>
              <span className="font-medium">
                {formatRupiah(payment?.change || 0)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
