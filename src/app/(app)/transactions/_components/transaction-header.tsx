import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/date';
import { useTranslations } from 'next-intl';
import type { TransactionDetails } from '@/lib/services/transaction/types';

interface TransactionHeaderProps {
  transaction: TransactionDetails;
}

export function TransactionHeader({ transaction }: TransactionHeaderProps) {
  const t = useTranslations('transaction.detailDialog');
  const tTable = useTranslations('transaction.table');
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">{t('date')}</p>
          <p className="font-medium">
            {formatDateTime(transaction?.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t('cashier')}</p>
          <p className="font-medium">
            {transaction?.cashier?.name || 'Unknown'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">{t('member')}</p>
          <div className="font-medium flex flex-wrap gap-2 items-center">
            {transaction?.member ? (
              <>
                {transaction.member.name}
                {transaction.member.tier && (
                  <Badge variant="outline">{transaction.member.tier}</Badge>
                )}
              </>
            ) : (
              'Guest'
            )}
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t('paymentMethod')}</p>
          <p className="font-medium capitalize">
            {transaction?.payment?.method === 'e_wallet'
              ? tTable('paymentMethods.e_wallet')
              : tTable(`paymentMethods.${transaction?.payment?.method || ''}`)}
          </p>
        </div>
      </div>
    </div>
  );
}
