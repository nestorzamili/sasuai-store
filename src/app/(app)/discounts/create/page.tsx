import { DiscountForm } from '../_components/discount-form';
export default function CreateDiscount() {
  return (
    <>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Create Discount</h1>
        <p className="text-sm text-muted-foreground">
          Create a new discount by filling out the form below. Make sure to
          provide all the necessary information.
        </p>
      </div>
      <DiscountForm type="create" />
    </>
  );
}
