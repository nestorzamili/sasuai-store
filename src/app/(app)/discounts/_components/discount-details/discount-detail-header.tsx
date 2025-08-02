'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatRupiah } from '@/lib/currency';
import type { DiscountWithRelations } from '@/lib/services/discount/types';

// === LOCAL TYPES ===
interface StatusInfo {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface DiscountDetailHeaderProps {
  discount: DiscountWithRelations | null;
  isLoading: boolean;
}

export function DiscountDetailHeader({
  discount,
  isLoading,
}: DiscountDetailHeaderProps) {
  const t = useTranslations('discount');

  // Determine if discount is expired
  const isExpired = discount && new Date(discount.endDate) < new Date();

  // Get status label and badge variant
  const getStatusInfo = (): StatusInfo => {
    if (!discount)
      return { label: t('detail.unavailable'), variant: 'outline' };
    if (!discount.isActive)
      return { label: t('table.inactive'), variant: 'outline' };
    if (isExpired)
      return { label: t('detail.expired'), variant: 'destructive' };
    return { label: t('table.active'), variant: 'default' };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : discount ? (
            <>
              {discount.name}
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </>
          ) : (
            t('detail.title')
          )}
        </DialogTitle>

        {!isLoading && discount && (
          <div className="mr-8">
            <Badge
              variant={discount.type === 'PERCENTAGE' ? 'default' : 'secondary'}
              className="text-lg px-3 py-1"
            >
              {discount.type === 'PERCENTAGE'
                ? `${discount.value}%`
                : formatRupiah(discount.value)}
            </Badge>
          </div>
        )}
      </div>

      {!isLoading && discount && discount.code && (
        <div className="mb-2">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {t('detail.code')}:
          </p>
          <Badge variant="outline" className="font-mono text-base px-3 py-1">
            {discount.code}
          </Badge>
        </div>
      )}

      {!isLoading && discount && !discount.code && (
        <DialogDescription className="mt-1">
          <span className="text-muted-foreground italic">
            {t('detail.noCodeRequired')}
          </span>
        </DialogDescription>
      )}
    </div>
  );
}
