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
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Discounts</h1>
        <ButtonOptions />
      </div>
      <DiscountTable />
    </div>
  );
}
