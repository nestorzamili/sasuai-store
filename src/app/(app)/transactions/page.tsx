'use client';

import { useTranslations } from 'next-intl';
import { TransactionTable } from './_components/transaction-table';

export default function TransactionsPage() {
  const t = useTranslations('transaction');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      <TransactionTable />
    </div>
  );
}
