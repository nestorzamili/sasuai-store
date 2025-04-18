'use client';
import { DiscountTable } from './discount-table';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function DiscountsMainContent() {
  const router = useRouter();

  const handleCreateClick = () => {
    router.push('/discounts/create');
  };

  const ButtonOptions = () => {
    return (
      <div className="flex gap-2">
        <Button variant={'default'} onClick={handleCreateClick}>
          Create <IconPlus />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Discounts</h2>
          <p className="text-muted-foreground">
            Manage your discount codes, offers, and promotions to boost sales
            and customer engagement.
          </p>
        </div>
        <ButtonOptions />
      </div>
      <DiscountTable />
    </div>
  );
}
