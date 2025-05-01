'use client';

import { useState } from 'react';
import { TransactionTable } from './_components/transaction-table';

export default function TransactionsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
        <p className="text-muted-foreground">
          View all transaction records in your store.
        </p>
      </div>
      <TransactionTable
        key={`transaction-table-${refreshTrigger}`}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
