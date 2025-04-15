import MainContentLayout from '@/components/layout/main-content';
import { DiscountForm } from '../_components/discount-form';
export default function CreateDiscount() {
  return (
    <>
      <MainContentLayout
        title="Create - Discounts"
        description="Manage your discounts and offers here."
      >
        <DiscountForm type="create" />
      </MainContentLayout>
    </>
  );
}
