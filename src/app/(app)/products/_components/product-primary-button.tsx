"use client";
import ProductCreateButton from "./product-create-dialog";
import ProductImportButton from "./product-import-dialog";

export default function ProductPrimaryButton() {
  return (
    <div className="flex gap-2">
      <ProductCreateButton />
      <ProductImportButton />
    </div>
  );
}
