'use client';

import { DiscountRelationDialog } from '@/app/(app)/discounts/_components/discount-relation-dialog';

export function DiscountRelationsClient() {
  return (
    <div className="container py-4">
      <h1 className="text-2xl font-bold mb-4">Discount Relations</h1>
      <div className="grid gap-4">
        <DiscountRelationDialog type="product" actionType="add" />
      </div>
    </div>
  );
}
