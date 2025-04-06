'use client';

import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { IconPlus } from '@tabler/icons-react';
import { ProductBatchFormInitialData } from '@/lib/types/product-batch';
import { Product } from '@prisma/client';
import { createBatch, updateBatch } from '../action';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, addMonths } from 'date-fns';
import { SupplierWithCount } from '@/lib/types/supplier';
import { UnitWithCounts } from '@/lib/types/unit';
import { ComboBox, ComboBoxOption } from '@/components/ui/combobox';

// Form schema for batch
const formSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  batchCode: z.string().min(1, 'Batch code is required'),
  expiryDate: z
    .date({
      required_error: 'Expiry date is required',
    })
    .min(new Date(), 'Expiry date must be in the future'),
  initialQuantity: z.coerce
    .number()
    .int()
    .positive('Initial quantity must be positive'),
  buyPrice: z.coerce.number().int().min(0, 'Buy price cannot be negative'),
  unitId: z.string().min(1, 'Unit is required'),
  supplierId: z.string().nullable().optional(), // Changed to accept null as well
});

type FormValues = z.infer<typeof formSchema>;

interface BatchFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: ProductBatchFormInitialData;
  products: Product[];
  units: UnitWithCounts[];
  suppliers: SupplierWithCount[];
  onSuccess?: () => void;
}

export default function BatchFormDialog({
  open,
  onOpenChange,
  initialData,
  products,
  units,
  suppliers,
  onSuccess,
}: BatchFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);

  // Convert data arrays to ComboBox options
  const productOptions: ComboBoxOption[] = useMemo(() => {
    return products.map((product) => ({
      value: product.id,
      label: product.name,
    }));
  }, [products]);

  const unitOptions: ComboBoxOption[] = useMemo(() => {
    return units.map((unit) => ({
      value: unit.id,
      label: `${unit.name} (${unit.symbol})`,
    }));
  }, [units]);

  const supplierOptions: ComboBoxOption[] = useMemo(() => {
    // Include a "None" option
    const options: ComboBoxOption[] = [{ value: 'none', label: 'None' }];

    // Add all suppliers
    suppliers.forEach((supplier) => {
      options.push({
        value: supplier.id,
        label: supplier.name,
      });
    });

    return options;
  }, [suppliers]);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: initialData?.productId || '',
      batchCode: initialData?.batchCode || '',
      expiryDate: initialData?.expiryDate
        ? new Date(initialData.expiryDate)
        : addMonths(new Date(), 6),
      initialQuantity: initialData?.initialQuantity || 0,
      buyPrice: initialData?.buyPrice || 0,
      unitId: initialData?.unitId || '',
      supplierId: initialData?.supplierId || null, // Changed to null instead of undefined
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        productId: initialData.productId || '',
        batchCode: initialData.batchCode || '',
        expiryDate: initialData.expiryDate
          ? new Date(initialData.expiryDate)
          : addMonths(new Date(), 6),
        initialQuantity: initialData.initialQuantity || 0,
        buyPrice: initialData.buyPrice || 0,
        unitId: initialData.unitId || '',
        supplierId: initialData.supplierId || null, // Changed to null
      });
    } else {
      form.reset({
        productId: '',
        batchCode: '',
        expiryDate: addMonths(new Date(), 6),
        initialQuantity: 0,
        buyPrice: 0,
        unitId: '',
        supplierId: null, // Changed to null
      });
    }
  }, [form, initialData]);

  // Auto-select unit based on product
  useEffect(() => {
    const productId = form.getValues('productId');
    if (productId) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        form.setValue('unitId', product.unitId);
      }
    }
  }, [form.watch('productId'), products, form]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      const result =
        isEditing && initialData?.id
          ? await updateBatch(initialData.id, {
              batchCode: values.batchCode,
              expiryDate: values.expiryDate,
              buyPrice: values.buyPrice,
            })
          : await createBatch({
              productId: values.productId,
              batchCode: values.batchCode,
              expiryDate: values.expiryDate,
              initialQuantity: values.initialQuantity,
              buyPrice: values.buyPrice,
              unitId: values.unitId,
              supplierId: values.supplierId,
            });

      if (result.success) {
        toast({
          title: isEditing ? 'Batch updated' : 'Batch created',
          description: isEditing
            ? 'Batch has been updated successfully'
            : 'New batch has been created',
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
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get the selected product
  const selectedProductId = form.watch('productId');
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="space-x-1">
          <span>Create Batch</span> <IconPlus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Batch' : 'Create Batch'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edit the batch information below'
              : 'Add a new product batch to your inventory'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product selection (only for new batches) */}
            {!isEditing && (
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <FormControl>
                      <ComboBox
                        options={productOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a product"
                        disabled={isEditing}
                        emptyMessage="No products found"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Batch Code */}
            <FormField
              control={form.control}
              name="batchCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter batch code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expiry Date - with auto-close when date is selected */}
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiry Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-auto p-0"
                      sideOffset={4}
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          // Auto-close the popover when a date is selected
                          document.body.click();
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="border-none"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Initial Quantity (only for new batches) */}
            {!isEditing && (
              <FormField
                control={form.control}
                name="initialQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter initial quantity"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Buy Price */}
            <FormField
              control={form.control}
              name="buyPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buy Price (IDR)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter buy price"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unit (only for new batches) */}
            {!isEditing && (
              <FormField
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <ComboBox
                        options={unitOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a unit"
                        disabled={isEditing || !!selectedProduct}
                        emptyMessage="No units found"
                      />
                    </FormControl>
                    {selectedProduct && (
                      <p className="text-sm text-muted-foreground">
                        Unit is automatically selected based on the product.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Supplier (only for new batches) */}
            {!isEditing && (
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier (optional)</FormLabel>
                    <FormControl>
                      <ComboBox
                        options={supplierOptions}
                        value={field.value || 'none'}
                        onChange={(value) =>
                          field.onChange(value === 'none' ? null : value)
                        }
                        placeholder="Select a supplier (optional)"
                        disabled={isEditing}
                        emptyMessage="No suppliers found"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                  <>{isEditing ? 'Update Batch' : 'Create Batch'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
