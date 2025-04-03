import MainContentLayout from '@/components/layout/main-content';
import { DiscountTable } from './discount-table';
export default function DiscountsMainContent() {
  return (
    <MainContentLayout
      title="Discounts"
      description="Manage your discounts and offers here."
    >
      {/* Table Here */}
      <DiscountTable />
    </MainContentLayout>
  );
}
