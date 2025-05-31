'use client';

import { DiscountTable } from './_components/discount-table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export default function DiscountsPage() {
  const t = useTranslations('discount');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Link href="/discounts/new">
          <Button variant="default" className="space-x-1">
            <span>{t('create')}</span> <IconPlus size={18} />
          </Button>
        </Link>
      </div>
      <DiscountTable />
    </div>
  );
}
