'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/currency';
import { Package, Tag } from 'lucide-react';
import type { TransactionDetails } from '@/lib/services/transaction/types';

interface TransactionDetailItemsProps {
  transaction: TransactionDetails;
}

export function TransactionDetailItems({
  transaction,
}: TransactionDetailItemsProps) {
  const t = useTranslations('transaction.detailDialog');

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {transaction.items?.map((item) => (
          <Card key={item.id} className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-base">
                      {item.product.name}
                    </h4>
                    {item.product.brand && (
                      <Badge variant="outline" className="text-xs">
                        {item.product.brand}
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {formatRupiah(item.product.price)} × {item.quantity}{' '}
                    {item.product.unit}
                  </div>

                  {/* Discount Information - Only if applied */}
                  {item.discountApplied && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-rose-600">
                      <Tag className="h-3 w-3" />
                      <span>
                        {item.discountApplied.name}: -
                        {formatRupiah(item.discountApplied.amount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  {item.discountApplied ? (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground line-through">
                        {formatRupiah(item.originalAmount)}
                      </div>
                      <div className="text-lg font-semibold text-primary">
                        {formatRupiah(item.discountApplied.discountedAmount)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-lg font-semibold">
                      {formatRupiah(item.originalAmount)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!transaction.items || transaction.items.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('noItemsFound')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
