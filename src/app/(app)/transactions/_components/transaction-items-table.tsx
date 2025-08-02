import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/currency';
import { useTranslations } from 'next-intl';
import type {
  TransactionDetails,
  TransactionItem,
} from '@/lib/services/transaction/types';

interface TransactionItemsTableProps {
  transaction: TransactionDetails;
}

export function TransactionItemsTable({
  transaction,
}: TransactionItemsTableProps) {
  const t = useTranslations('transaction.detailDialog');
  const items = transaction?.items || [];

  return (
    <div>
      <h3 className="font-semibold mb-3">
        {t('items')} ({items.length})
      </h3>

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[300px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 sticky top-0 bg-muted z-10">
                  {t('product')}
                </th>
                <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                  {t('unitPrice')}
                </th>
                <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                  {t('quantity')}
                </th>
                <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                  {t('subtotal')}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: TransactionItem, index: number) => (
                <tr
                  key={item?.id || index}
                  className="border-t hover:bg-muted/50 transition-colors"
                >
                  <td className="p-3">
                    <div className="break-words max-w-[200px] sm:max-w-[300px]">
                      <p className="font-medium">
                        {item?.product?.name || 'Unknown Product'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item?.product?.unit || item?.product?.category || ''}
                      </p>
                      {item?.discountApplied && (
                        <div className="mt-1">
                          <Badge
                            variant="outline"
                            className="text-xs text-rose-600"
                          >
                            {item.discountApplied.name}: -
                            {formatRupiah(item.discountApplied.amount)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-right p-3 whitespace-nowrap">
                    {formatRupiah(item?.product?.price || 0)}
                  </td>
                  <td className="text-right p-3 whitespace-nowrap">
                    {item?.quantity || 0}
                  </td>
                  <td className="text-right p-3 whitespace-nowrap font-medium">
                    {formatRupiah(item?.originalAmount || 0)}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-4 text-center text-muted-foreground"
                  >
                    {t('noItems')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
