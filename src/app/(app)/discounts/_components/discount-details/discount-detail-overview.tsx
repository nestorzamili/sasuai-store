'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  IconCalendar,
  IconTicket,
  IconPercentage,
  IconUsers,
  IconBoxSeam,
  IconCreditCard,
  IconShoppingCart,
  IconBadge,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import type {
  DiscountWithRelations,
  DiscountApplyTo,
} from '@/lib/services/discount/types';

interface DiscountDetailOverviewProps {
  discount: DiscountWithRelations;
}

export function DiscountDetailOverview({
  discount,
}: DiscountDetailOverviewProps) {
  const t = useTranslations('discount');
  const tFilters = useTranslations('discount.filters');

  // Calculate usage percentage
  const usagePercentage = discount?.maxUses
    ? Math.min(100, (discount.usedCount / discount.maxUses) * 100)
    : 0;

  // Format date range to be more readable
  const formatDateRange = (): string => {
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);
    return `${format(start, 'dd MMM yyyy')} - ${format(end, 'dd MMM yyyy')}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <IconCalendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {t('detail.validityPeriod')}
                </span>
              </div>
              <p className="font-medium">{formatDateRange()}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <IconShoppingCart className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {t('detail.minPurchase')}
                </span>
              </div>
              <p className="font-medium">
                {discount.minPurchase
                  ? `Rp ${discount.minPurchase.toLocaleString()}`
                  : t('detail.noMinimum')}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                {discount.isGlobal ? (
                  <IconPercentage className="h-4 w-4" />
                ) : discount.applyTo === 'SPECIFIC_PRODUCTS' ? (
                  <IconBoxSeam className="h-4 w-4" />
                ) : discount.applyTo === 'SPECIFIC_MEMBERS' ? (
                  <IconUsers className="h-4 w-4" />
                ) : (
                  <IconBadge className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {t('detail.application')}
                </span>
              </div>
              <p className="font-medium">
                {discount.isGlobal
                  ? t('detail.globalDiscount')
                  : (() => {
                      const applyTo = discount.applyTo as DiscountApplyTo;
                      let translationKey = '';

                      switch (applyTo) {
                        case 'SPECIFIC_PRODUCTS':
                          translationKey = 'specificProducts';
                          break;
                        case 'SPECIFIC_MEMBERS':
                          translationKey = 'specificMembers';
                          break;
                        case 'SPECIFIC_MEMBER_TIERS':
                          translationKey = 'memberTiers';
                          break;
                        case 'ALL':
                        default:
                          translationKey = 'allApplications';
                          break;
                      }

                      return tFilters(translationKey);
                    })()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {discount.maxUses && discount.maxUses > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <IconCreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t('detail.usageLimit')}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {t('detail.used')}: {discount.usedCount} {t('detail.times')}
                </span>
                <span>
                  {t('detail.limit')}: {discount.maxUses}
                </span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {discount.description && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <IconTicket className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t('detail.description')}
              </span>
            </div>
            <p className="text-sm whitespace-pre-line">
              {discount.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
