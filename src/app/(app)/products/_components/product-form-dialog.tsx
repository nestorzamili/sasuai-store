'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { ProductWithRelations } from '@/lib/types/product';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { IconPlus } from '@tabler/icons-react';
import { createProduct, getProductFormOptions, updateProduct } from '../action';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Brand, Category, Unit } from '@prisma/client';

// Form schema for product
const formSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  unitId: z.string().min(1, 'Unit is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  skuCode: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: ProductWithRelations;
  onSuccess?: () => void;
}

export default function ProductFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: ProductFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);
  const { toast } = useToast();

  // Form options state
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]); // Will be implemented later

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      categoryId: initialData?.categoryId || '',
      brandId: initialData?.brandId || null,
      description: initialData?.description || '',
      unitId: initialData?.unitId || '',
      price: initialData?.price || 0,
      skuCode: initialData?.skuCode || '',
      barcode: initialData?.barcode || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  // Fetch form options (categories, brands, units)
  useEffect(() => {
    async function fetchOptions() {
      try {
        const result = await getProductFormOptions();
        if (result.success && result.data) {
          setCategories(result.data.categories);
          setBrands(result.data.brands);
          // Units will be implemented later
        }
      } catch (error) {
        console.error('Error fetching form options:', error);
      }
    }
    fetchOptions();
  }, []);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        categoryId: initialData.categoryId || '',
        brandId: initialData.brandId || null,
        description: initialData.description || '',
        unitId: initialData.unitId || '',
        price: initialData.price || 0,
        skuCode: initialData.skuCode || '',
        barcode: initialData.barcode || '',
        isActive: initialData.isActive ?? true,
      });
    } else {
      form.reset({
        name: '',
        categoryId: '',
        brandId: null,
        description: '',
        unitId: '',
        price: 0,
        skuCode: '',
        barcode: '',
        isActive: true,
      });
    }
  }, [form, initialData]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      const result =
        isEditing && initialData
          ? await updateProduct(initialData.id, values)
          : await createProduct(values);

      if (result.success) {
        toast({
          title: isEditing ? 'Product updated' : 'Product created',
          description: isEditing
            ? 'Product has been updated successfully'
            : 'New product has been created',
        });

        form.reset();
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Something went wrong',
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="space-x-1">
          <span>Add Product</span> <IconPlus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Product' : 'Create Product'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edit the product information below'
              : 'Add a new product to your store'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <FormField
                control={form.control}
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

              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Brand */}
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        // Convert "none" to null
                        field.onChange(value === 'none' ? null : value);
                      }}
                      defaultValue={field.value || 'none'}
                      value={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SKU Code */}
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Product Status
                      </FormLabel>
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
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description (optional)"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange && onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>{isEditing ? 'Updating...' : 'Creating...'}</>
                ) : (
                  <>{isEditing ? 'Update Product' : 'Create Product'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
