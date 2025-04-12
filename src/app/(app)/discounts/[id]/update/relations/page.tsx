import MainContentLayout from '@/components/layout/main-content';
interface DiscountRelationDialogProps {
  type: 'member' | 'product';
  actionType: 'add' | 'edit' | 'delete';
}
export default function CreateRelation({
  type,
  actionType,
}: DiscountRelationDialogProps) {
  return (
    <>
      <MainContentLayout
        title={`Manage Relations - Discounts - ${type} `}
        description="Manage your discounts relation and offers here."
      >
        <h1>Relation</h1>
      </MainContentLayout>
    </>
  );
}
