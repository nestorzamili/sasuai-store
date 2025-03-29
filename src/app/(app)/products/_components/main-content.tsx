import ProductPrimaryButton from "./product-primary-button";
import { ProductTable } from "./product-table";
export default function MainContent() {
  return (
    <div className="mb-2 flex items-center justify-between space-y-2 flex-wrap gap-x-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Product</h2>
        <p className="text-muted-foreground">
          Manage your product settings and set your preferences.
        </p>
      </div>
      <ProductPrimaryButton />
      <ProductTable />
    </div>
  );
}
