'use client';

import { TransactionTable } from './_components/transaction-table';

export default function TransactionsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
        <p className="text-muted-foreground">
          View all transaction records in your store.
        </p>
      </div>
      <TransactionTable />
    </div>
  );
}
