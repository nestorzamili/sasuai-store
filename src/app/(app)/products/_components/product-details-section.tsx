'use client';

import { useFormContext } from 'react-hook-form';
import { ProductFormValues } from './product-form-provider';
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
import { CategoryCombobox } from './category-combobox';
import { BrandCombobox } from './brand-combobox';
import { UnitCombobox } from './unit-combobox';

export function ProductDetailsSection() {
  const { control } = useFormContext<ProductFormValues>();

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
                <FormLabel>Product Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
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
              <FormLabel>Category*</FormLabel>
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
              <FormLabel>Brand</FormLabel>
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
              <FormLabel>Unit*</FormLabel>
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
              <FormLabel>Price*</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
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

        {/* SKU Code */}
        <FormField
          control={control}
          name="skuCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter SKU code"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
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
              <FormLabel>Barcode</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter barcode"
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
                <FormLabel className="text-base">Product Status</FormLabel>
                <FormDescription>
                  {field.value ? 'Active' : 'Inactive'}
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
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter product description (optional)"
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
