'use client';
import MainContentLayout from '@/components/layout/main-content';
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
    <MainContentLayout
      title="Discounts"
      description="Manage your discounts and offers here."
      buttonOptions={ButtonOptions()}
    >
      {/* Table Here */}
      <DiscountTable />
    </MainContentLayout>
  );
}
