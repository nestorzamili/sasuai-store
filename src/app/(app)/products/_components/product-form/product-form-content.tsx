'use client';

import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProductForm } from './product-form-provider';
import { ProductImagesSection } from './product-images-section';
import { ProductDetailsSection } from './product-details-section';
import { CreateCategoryDialog } from './create-category-dialog';
import { CreateBrandDialog } from './create-brand-dialog';
import { CreateUnitDialog } from './create-unit-dialog';

export function ProductFormContent() {
  const { loading, isEditing, submitForm } = useProductForm();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        {/* Left side - Images */}
        <ProductImagesSection />

        {/* Right side - Form fields */}
        <ProductDetailsSection />
      </div>

      <DialogFooter className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => submitForm()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="button" onClick={() => submitForm()} disabled={loading}>
          {loading ? (
            <>{isEditing ? 'Updating...' : 'Creating...'}</>
          ) : (
            <>{isEditing ? 'Update Product' : 'Create Product'}</>
          )}
        </Button>
      </DialogFooter>

      {/* Dialogs for creating new entities */}
      <CreateCategoryDialog />
      <CreateBrandDialog />
      <CreateUnitDialog />
    </>
  );
}
