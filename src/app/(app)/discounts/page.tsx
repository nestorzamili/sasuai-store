'use client';

import { useState } from 'react';
import { DiscountTable } from './_components/discount-table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';

export default function DiscountsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Discounts</h2>
          <p className="text-muted-foreground">
            Manage your promotional discounts here. Create different types of
            discounts for products and members.
          </p>
        </div>
        <Link href="/discounts/new">
          <Button variant="default" className="space-x-1">
            <span>Create</span> <IconPlus size={18} />
          </Button>
        </Link>
      </div>
      <DiscountTable
        onRefresh={handleSuccess}
        key={`discount-table-${refreshTrigger}`}
      />
    </div>
  );
}
