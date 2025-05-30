'use client';

import { useTranslations } from 'next-intl';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProductForm } from './product-form-provider';
import { ProductImagesSection } from './product-images-section';
import { ProductDetailsSection } from './product-details-section';
import { CreateCategoryDialog } from './create-category-dialog';
import { CreateBrandDialog } from './create-brand-dialog';
import { CreateUnitDialog } from './create-unit-dialog';

export function ProductFormContent() {
  const t = useTranslations('product.formContent');
  const { loading, isEditing, submitForm, cancelForm } = useProductForm();

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
          onClick={() => cancelForm()}
          disabled={loading}
        >
          {t('cancel')}
        </Button>
        <Button type="button" onClick={() => submitForm()} disabled={loading}>
          {loading ? (
            <>{isEditing ? t('updating') : t('creating')}</>
          ) : (
            <>{isEditing ? t('updateButton') : t('createButton')}</>
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
