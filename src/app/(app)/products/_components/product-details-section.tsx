'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ProductFormValues, useProductForm } from './product-form-provider';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { IconRefresh } from '@tabler/icons-react';
import { CategoryCombobox } from './category-combobox';
import { BrandCombobox } from './brand-combobox';
import { UnitCombobox } from './unit-combobox';
import { generateSKU, generateCategoryPrefix } from '@/utils/sku-generator';

export function ProductDetailsSection() {
  const t = useTranslations('product.detailsSection');
  const { control, setValue } = useFormContext<ProductFormValues>();
  const { categories, isEditing } = useProductForm();
  const [skuGenerated, setSkuGenerated] = useState(false);

  // Watch for product name and category changes to auto-generate SKU
  const productName = useWatch({ control, name: 'name' });
  const categoryId = useWatch({ control, name: 'categoryId' });
  const skuCode = useWatch({ control, name: 'skuCode' });

  useEffect(() => {
    // Only auto-generate SKU for new products and when the name is entered
    if (!isEditing && productName && !skuGenerated && !skuCode) {
      // Find the category name from the selected categoryId
      const selectedCategory = categories.find((cat) => cat.id === categoryId);
      const categoryPrefix = selectedCategory
        ? generateCategoryPrefix(selectedCategory.name)
        : '';

      // Generate the SKU
      const generatedSKU = generateSKU(productName, categoryPrefix);

      // Set the generated SKU
      setValue('skuCode', generatedSKU);
      setSkuGenerated(true);
    }
  }, [
    productName,
    categoryId,
    setValue,
    categories,
    isEditing,
    skuGenerated,
    skuCode,
  ]);

  // Handle manual SKU regeneration
  const handleRegenerateSKU = () => {
    const selectedCategory = categories.find((cat) => cat.id === categoryId);
    const categoryPrefix = selectedCategory
      ? generateCategoryPrefix(selectedCategory.name)
      : '';

    const generatedSKU = generateSKU(productName, categoryPrefix);
    setValue('skuCode', generatedSKU);
    setSkuGenerated(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <div className="md:col-span-2">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('productName')}*</FormLabel>
                <FormControl>
                  <Input placeholder={t('productNamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category Combobox */}
        <FormField
          control={control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('category')}*</FormLabel>
              <CategoryCombobox value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Brand Combobox */}
        <FormField
          control={control}
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('brand')}</FormLabel>
              <BrandCombobox
                value={field.value || ''}
                onChange={(value) =>
                  field.onChange(value === '' ? null : value)
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Unit Combobox */}
        <FormField
          control={control}
          name="unitId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('unit')}*</FormLabel>
              <UnitCombobox value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price */}
        <FormField
          control={control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('price')}*</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('pricePlaceholder')}
                  value={field.value === 0 ? '' : field.value}
                  onFocus={(e) => {
                    if (e.target.value === '0') {
                      e.target.value = '';
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      field.onChange(0);
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? 0 : Number(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SKU Code with auto-generation */}
        <FormField
          control={control}
          name="skuCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('skuCode')}</FormLabel>
              <div className="flex gap-2 items-center">
                <FormControl>
                  <Input
                    placeholder={t('skuCodePlaceholder')}
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      // If manually edited, don't auto-generate again
                      if (e.target.value) {
                        setSkuGenerated(true);
                      }
                    }}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRegenerateSKU}
                  title={t('generateSku')}
                >
                  <IconRefresh size={16} />
                </Button>
              </div>
              <FormDescription>
                {!isEditing ? t('skuDescriptionNew') : t('skuDescriptionEdit')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Barcode */}
        <FormField
          control={control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('barcode')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('barcodePlaceholder')}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t('productStatus')}
                </FormLabel>
                <FormDescription>
                  {field.value ? t('active') : t('inactive')}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Description */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('description')}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t('descriptionPlaceholder')}
                className="min-h-[120px] resize-none"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
