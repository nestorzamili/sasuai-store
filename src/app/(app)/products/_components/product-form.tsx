'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ComboBox, ComboBoxOption } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { IconPlus, IconTrash, IconArrowLeft } from '@tabler/icons-react';
import { ProductFormData } from '@/lib/types/product';
import { formatRupiah } from '@/lib/currency';
import { createProduct, updateProduct } from '../action';
import { getAllCategories } from '../categories/action';
import { getAllBrands } from '../brands/action';
import { getAllUnits } from '../units/action';

// Schema for form validation
const formSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, 'Variant name is required'),
        unitId: z.string().min(1, 'Unit is required'),
        price: z.coerce
          .number()
          .min(0, 'Price must be greater than or equal to 0'),
        skuCode: z.string().optional(),
      }),
    )
    .min(1, 'At least one variant is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: any; // For edit mode
  isEdit?: boolean;
}

export default function ProductForm({
  initialData,
  isEdit = false,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ComboBoxOption[]>([]);
  const [brands, setBrands] = useState<ComboBoxOption[]>([]);
  const [units, setUnits] = useState<ComboBoxOption[]>([]);

  // Initialize form with default values or edit data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      categoryId: '',
      brandId: '',
      description: '',
      isActive: true,
      variants: [
        {
          name: '',
          unitId: '',
          price: 0,
          skuCode: '',
        },
      ],
    },
  });

  // Field array for variants
  const { fields, append, remove } = useFieldArray({
    name: 'variants',
    control: form.control,
  });

  // Load reference data (categories, brands, units)
  useEffect(() => {
    async function loadReferenceData() {
      try {
        // Load categories
        const categoriesResponse = await getAllCategories();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(
            categoriesResponse.data.map((item) => ({
              value: item.id,
              label: item.name,
            })),
          );
        }

        // Load brands
        const brandsResponse = await getAllBrands();
        if (brandsResponse.success && brandsResponse.data) {
          setBrands(
            brandsResponse.data.map((item) => ({
              value: item.id,
              label: item.name,
            })),
          );
        }

        // Load units from the database
        const unitsResponse = await getAllUnits();
        if (unitsResponse.success && unitsResponse.data) {
          setUnits(
            unitsResponse.data.map((unit) => ({
              value: unit.id,
              label: `${unit.name} (${unit.symbol})`,
            })),
          );
        } else {
          console.error('Failed to load units:', unitsResponse.error);
          toast({
            title: 'Warning',
            description:
              'Failed to load units. Some options may not be available.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error loading reference data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load form data',
          variant: 'destructive',
        });
      }
    }

    loadReferenceData();
  }, []);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      // Process form values if needed
      const formattedValues: ProductFormData = {
        ...values,
      };

      // Submit the form data
      const result = isEdit
        ? await updateProduct(initialData.id, formattedValues)
        : await createProduct(formattedValues);

      if (result.success) {
        toast({
          title: isEdit ? 'Product Updated' : 'Product Created',
          description: isEdit
            ? 'Product has been updated successfully'
            : 'New product has been created successfully',
        });
        router.push('/products');
      } else {
        toast({
          title: 'Submission Failed',
          description: result.error || 'An error occurred during submission',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => router.back()}
          size="sm"
        >
          <IconArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEdit ? 'Edit Product' : 'Create Product'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit
              ? 'Update product information and variants'
              : 'Add a new product to your catalog'}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <ComboBox
                  options={categories}
                  value={form.watch('categoryId')}
                  onChange={(value) => form.setValue('categoryId', value)}
                  placeholder="Select a category"
                />
                {form.formState.errors.categoryId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <ComboBox
                  options={brands}
                  value={form.watch('brandId') || ''}
                  onChange={(value) =>
                    form.setValue('brandId', value || undefined)
                  }
                  placeholder="Select a brand (optional)"
                />
                {form.formState.errors.brandId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.brandId.message}
                  </p>
                )}
              </div>

              {/* Active Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={form.watch('isActive')}
                    onCheckedChange={(checked) =>
                      form.setValue('isActive', checked)
                    }
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    {form.watch('isActive') ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>

              {/* Description - Full width */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description (optional)"
                  {...form.register('description')}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Variants Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Variants</h3>
            <Button
              type="button"
              onClick={() =>
                append({
                  name: '',
                  unitId: '',
                  price: 0,
                  skuCode: '',
                })
              }
              variant="outline"
              size="sm"
            >
              <IconPlus className="h-4 w-4 mr-1" /> Add Variant
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between md:col-span-2">
                      <h4 className="font-medium">Variant {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => remove(index)}
                        >
                          <IconTrash className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      )}
                    </div>

                    <Separator className="md:col-span-2 my-2" />

                    {/* Variant Name */}
                    <div className="space-y-2">
                      <Label htmlFor={`variants.${index}.name`}>
                        Variant Name
                      </Label>
                      <Input
                        id={`variants.${index}.name`}
                        placeholder="E.g., Small, Medium, Red, etc."
                        {...form.register(`variants.${index}.name`)}
                      />
                      {form.formState.errors.variants?.[index]?.name && (
                        <p className="text-sm text-destructive">
                          {
                            form.formState.errors.variants?.[index]?.name
                              ?.message
                          }
                        </p>
                      )}
                    </div>

                    {/* SKU */}
                    <div className="space-y-2">
                      <Label htmlFor={`variants.${index}.skuCode`}>
                        SKU Code
                      </Label>
                      <Input
                        id={`variants.${index}.skuCode`}
                        placeholder="Enter SKU code (optional)"
                        {...form.register(`variants.${index}.skuCode`)}
                      />
                    </div>

                    {/* Unit */}
                    <div className="space-y-2">
                      <Label htmlFor={`variants.${index}.unitId`}>Unit</Label>
                      <ComboBox
                        options={units}
                        value={form.watch(`variants.${index}.unitId`)}
                        onChange={(value) =>
                          form.setValue(`variants.${index}.unitId`, value)
                        }
                        placeholder="Select unit of measurement"
                      />
                      {form.formState.errors.variants?.[index]?.unitId && (
                        <p className="text-sm text-destructive">
                          {
                            form.formState.errors.variants?.[index]?.unitId
                              ?.message
                          }
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <Label htmlFor={`variants.${index}.price`}>Price</Label>
                      <Input
                        id={`variants.${index}.price`}
                        type="number"
                        placeholder="Enter price"
                        {...form.register(`variants.${index}.price`)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {formatRupiah(
                          form.watch(`variants.${index}.price`) || 0,
                        )}
                      </p>
                      {form.formState.errors.variants?.[index]?.price && (
                        <p className="text-sm text-destructive">
                          {
                            form.formState.errors.variants?.[index]?.price
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {form.formState.errors.variants?.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.variants.root.message}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? isEdit
                ? 'Updating...'
                : 'Creating...'
              : isEdit
              ? 'Update Product'
              : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
