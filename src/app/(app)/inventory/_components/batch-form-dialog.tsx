'use client';

import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { getAllProducts } from '@/app/(app)/products/action';
import { getAllUnits } from '@/app/(app)/products/units/action';
import { getAllSuppliers } from '@/app/(app)/suppliers/action';
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
import { IconPlus, IconRefresh, IconInfoCircle } from '@tabler/icons-react';
import { ProductBatchFormInitialData } from '@/lib/types/product-batch';
import { Product } from '@prisma/client';
import { createBatch, updateBatch } from '../action';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  supplierId: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Define tooltip content for form fields
const TOOLTIPS = {
  product: "Select the product you're adding inventory for",
  batchCode:
    'Unique code to identify this batch. Auto-generated based on product name and date',
  expiryDate:
    'The date when this product batch expires. Important for inventory management',
  initialQuantity:
    "The number of items in this batch. This will increase the product's total stock",
  buyPrice:
    'The purchase price for the ENTIRE batch, not per unit. Used to calculate profit margins',
  unit: 'The unit of measurement for this product (e.g., pieces, boxes)',
  supplier: 'The supplier who provided this batch (optional)',
};

interface BatchFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: ProductBatchFormInitialData;
  onSuccess?: () => void;
}

// Helper function to create label with tooltip (moved outside component)
const LabelWithTooltip = ({
  label,
  tooltipContent,
}: {
  label: string;
  tooltipContent: string;
}) => (
  <div className="flex items-center gap-1.5">
    <span>{label}</span>
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger type="button" className="cursor-help">
          <IconInfoCircle
            size={15}
            className="text-muted-foreground hover:text-foreground transition-colors"
          />
        </TooltipTrigger>
        <TooltipContent sideOffset={5} className="max-w-[260px] text-sm">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

// Reusable FormField component for ComboBox
const ComboBoxFormField = ({
  name,
  label,
  tooltip,
  options,
  control,
  disabled = false,
  placeholder,
  emptyMessage,
  helperText,
  transform,
}: {
  name: keyof FormValues;
  label: string;
  tooltip: string;
  options: ComboBoxOption[];
  control: any;
  disabled?: boolean;
  placeholder: string;
  emptyMessage: string;
  helperText?: string;
  transform?: (value: string) => string | null;
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          <LabelWithTooltip label={label} tooltipContent={tooltip} />
        </FormLabel>
        <FormControl>
          <ComboBox
            options={options}
            value={field.value || ''}
            onChange={(value) =>
              field.onChange(transform ? transform(value) : value)
            }
            placeholder={placeholder}
            disabled={disabled}
            emptyMessage={emptyMessage}
          />
        </FormControl>
        {helperText && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
        <FormMessage />
      </FormItem>
    )}
  />
);

export default function BatchFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: BatchFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);

  // Generate a batch code based on the selected product
  const generateBatchCode = (productId: string) => {
    if (!productId) return '';

    const product = products.find((p) => p.id === productId);
    if (!product) return '';

    const prefix = product.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 3);

    const dateStr = format(new Date(), 'yyyyMMdd');
    const randomSuffix = Math.floor(Math.random() * 900 + 100);

    return `${prefix}-${dateStr}-${randomSuffix}`;
  };
  // State for data from APIs
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<UnitWithCounts[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierWithCount[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await getAllProducts();
        setProducts(productsData.data || []);

        const unitsData = await getAllUnits();
        setUnits(unitsData.data || []);

        const suppliersData = await getAllSuppliers();
        setSuppliers(
          suppliersData.data?.map((supplier) => ({
            ...supplier,
            _count: { stockIns: 0 }, // Adding the missing _count property
          })) || [],
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load necessary data',
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, []);

  // Convert data arrays to ComboBox options
  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: product.id,
        label: product.name,
      })),
    [products],
  );

  const unitOptions = useMemo(
    () =>
      units.map((unit) => ({
        value: unit.id,
        label: `${unit.name} (${unit.symbol})`,
      })),
    [units],
  );

  const supplierOptions = useMemo(
    () => [
      { value: 'none', label: 'None' },
      ...suppliers.map((supplier) => ({
        value: supplier.id,
        label: supplier.name,
      })),
    ],
    [suppliers],
  );

  // Default form values
  const defaultValues = {
    productId: '',
    batchCode: '',
    expiryDate: addMonths(new Date(), 6),
    initialQuantity: 0,
    buyPrice: 0,
    unitId: '',
    supplierId: null,
  };

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          productId: initialData.productId || '',
          batchCode: initialData.batchCode || '',
          expiryDate: initialData.expiryDate
            ? new Date(initialData.expiryDate)
            : addMonths(new Date(), 6),
          initialQuantity: initialData.initialQuantity || 0,
          buyPrice: initialData.buyPrice || 0,
          unitId: initialData.unitId || '',
          supplierId: initialData.supplierId || null,
        }
      : defaultValues,
  });

  // Regenerate batch code
  const regenerateBatchCode = () => {
    const productId = form.getValues('productId');
    if (productId) {
      const newBatchCode = generateBatchCode(productId);
      form.setValue('batchCode', newBatchCode);
    }
  };

  // Update form when initialData changes or product changes
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
        supplierId: initialData.supplierId || null,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [form, initialData]);

  // Handle product selection
  useEffect(() => {
    const productId = form.getValues('productId');
    if (!productId) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Auto-select unit based on product
    form.setValue('unitId', product.unitId);

    // Generate batch code for new batches
    if (
      !isEditing &&
      (!form.getValues('batchCode') || form.getValues('batchCode') === '')
    ) {
      const newBatchCode = generateBatchCode(productId);
      form.setValue('batchCode', newBatchCode);
    }
  }, [form.watch('productId'), products, form, isEditing]);

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
              <ComboBoxFormField
                name="productId"
                label="Product"
                tooltip={TOOLTIPS.product}
                options={productOptions}
                control={form.control}
                disabled={isEditing}
                placeholder="Select a product"
                emptyMessage="No products found"
              />
            )}

            {/* Batch Code - with automatic generation */}
            <FormField
              control={form.control}
              name="batchCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <LabelWithTooltip
                      label="Batch Code"
                      tooltipContent={TOOLTIPS.batchCode}
                    />
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="Auto-generated batch code"
                        {...field}
                        className="flex-grow"
                      />
                    </FormControl>
                    {!isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={regenerateBatchCode}
                        className="flex-shrink-0"
                        title="Generate new batch code"
                      >
                        <IconRefresh size={16} />
                      </Button>
                    )}
                  </div>
                  {!isEditing && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Batch code is auto-generated but can be edited if needed
                    </p>
                  )}
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
                  <FormLabel>
                    <LabelWithTooltip
                      label="Expiry Date"
                      tooltipContent={TOOLTIPS.expiryDate}
                    />
                  </FormLabel>
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
                          if (date) {
                            field.onChange(date);
                            document.body.click(); // Close popover
                          }
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
                    <FormLabel>
                      <LabelWithTooltip
                        label="Initial Quantity"
                        tooltipContent={TOOLTIPS.initialQuantity}
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter initial quantity"
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
            )}

            {/* Buy Price */}
            <FormField
              control={form.control}
              name="buyPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <LabelWithTooltip
                      label="Buy Price (IDR)"
                      tooltipContent={TOOLTIPS.buyPrice}
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter buy price"
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Total purchase price for the entire batch, not per unit
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unit (only for new batches) */}
            {!isEditing && (
              <ComboBoxFormField
                name="unitId"
                label="Unit"
                tooltip={TOOLTIPS.unit}
                options={unitOptions}
                control={form.control}
                disabled={isEditing || !!selectedProduct}
                placeholder="Select a unit"
                emptyMessage="No units found"
                helperText={
                  selectedProduct
                    ? 'Unit is automatically selected based on the product.'
                    : undefined
                }
              />
            )}

            {/* Supplier (only for new batches) */}
            {!isEditing && (
              <ComboBoxFormField
                name="supplierId"
                label="Supplier (optional)"
                tooltip={TOOLTIPS.supplier}
                options={supplierOptions}
                control={form.control}
                disabled={isEditing}
                placeholder="Select a supplier (optional)"
                emptyMessage="No suppliers found"
                transform={(value) => (value === 'none' ? null : value)}
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
                {loading
                  ? isEditing
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditing
                  ? 'Update Batch'
                  : 'Create Batch'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
