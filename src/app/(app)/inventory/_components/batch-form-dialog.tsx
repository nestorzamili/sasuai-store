'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Control } from 'react-hook-form';
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
import {
  ProductBatchFormInitialData,
  Product,
  Unit,
  Supplier,
  extractUnitsArray,
  extractSuppliersArray,
} from '@/lib/types/inventory';
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

interface BatchFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: ProductBatchFormInitialData;
  onSuccess?: () => void;
  triggerText?: string;
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
  control: Control<FormValues>;
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
            value={String(field.value || '')}
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
  triggerText,
}: BatchFormDialogProps) {
  const t = useTranslations('inventory.batchFormDialog');
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);

  // Define tooltip content using translations
  const TOOLTIPS = useMemo(
    () => ({
      product: t('tooltips.product'),
      batchCode: t('tooltips.batchCode'),
      expiryDate: t('tooltips.expiryDate'),
      initialQuantity: t('tooltips.initialQuantity'),
      buyPrice: t('tooltips.buyPrice'),
      unit: t('tooltips.unit'),
      supplier: t('tooltips.supplier'),
    }),
    [t],
  );

  // State for data from APIs - MOVED BEFORE generateBatchCode
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Memoize the batch code generation function
  const generateBatchCode = useCallback(
    (productId: string) => {
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
    },
    [products],
  );

  // Memoize data fetching to prevent unnecessary API calls
  const fetchData = useCallback(async () => {
    try {
      // Get products data
      const productsResponse = await getAllProducts();
      if (productsResponse.success && productsResponse.data) {
        setProducts(productsResponse.data as Product[]);
      } else {
        setProducts([]);
      }

      // Get units data
      const unitsResponse = await getAllUnits();
      if (unitsResponse.success && unitsResponse.data) {
        const unitsData = extractUnitsArray(unitsResponse.data);
        setUnits(unitsData);
      } else {
        setUnits([]);
      }

      // Get suppliers data
      const suppliersResponse = await getAllSuppliers();
      if (suppliersResponse.success && suppliersResponse.data) {
        const suppliersData = extractSuppliersArray(suppliersResponse.data);
        setSuppliers(suppliersData);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadData'),
        variant: 'destructive',
      });
      // Set empty arrays on error
      setProducts([]);
      setUnits([]);
      setSuppliers([]);
    }
  }, [t]);

  // Fetch data on component mount - only when dialog opens
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  // Convert data arrays to ComboBox options - memoized
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
      { value: 'none', label: t('none') },
      ...suppliers.map((supplier) => ({
        value: supplier.id,
        label: supplier.name,
      })),
    ],
    [suppliers, t],
  );

  // Default form values - memoized
  const defaultValues = useMemo(
    () => ({
      productId: '',
      batchCode: '',
      expiryDate: addMonths(new Date(), 6),
      initialQuantity: 0,
      buyPrice: 0,
      unitId: '',
      supplierId: null,
    }),
    [],
  );

  // Initialize the form - memoized initial values
  const formInitialValues = useMemo(() => {
    if (initialData) {
      return {
        productId: initialData.productId || '',
        batchCode: initialData.batchCode || '',
        expiryDate: initialData.expiryDate
          ? new Date(initialData.expiryDate)
          : addMonths(new Date(), 6),
        initialQuantity: initialData.initialQuantity || 0,
        buyPrice: initialData.buyPrice || 0,
        unitId: initialData.unitId || '',
        supplierId: initialData.supplierId || null,
      };
    }
    return defaultValues;
  }, [initialData, defaultValues]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: formInitialValues,
  });

  // Regenerate batch code - memoized
  const regenerateBatchCode = useCallback(() => {
    const productId = form.getValues('productId');
    if (productId) {
      const newBatchCode = generateBatchCode(productId);
      form.setValue('batchCode', newBatchCode);
    }
  }, [form, generateBatchCode]);

  // Update form when initialData changes or product changes
  useEffect(() => {
    form.reset(formInitialValues);
  }, [form, formInitialValues]);

  // Extract watched productId to a variable for dependency array
  const watchedProductId = form.watch('productId');

  // Handle product selection - memoized
  const handleProductSelection = useCallback(() => {
    const productId = watchedProductId;
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
  }, [watchedProductId, products, form, isEditing, generateBatchCode]);

  useEffect(() => {
    handleProductSelection();
  }, [handleProductSelection]);

  // Handle form submission - memoized
  const onSubmit = useCallback(
    async (values: FormValues) => {
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
            title: isEditing ? t('batchUpdated') : t('batchCreated'),
            description: isEditing
              ? t('batchUpdateSuccess')
              : t('newBatchSuccess'),
          });

          form.reset();

          // Close the dialog when successful
          if (onOpenChange) {
            onOpenChange(false);
          }

          // Call onSuccess after a short delay to allow the dialog to close
          setTimeout(() => {
            onSuccess?.();
          }, 100);
        } else {
          toast({
            title: t('error'),
            description: result.error || t('somethingWrong'),
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error in batch form submission:', error);
        toast({
          title: t('error'),
          description: t('unexpectedError'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [isEditing, initialData?.id, form, onOpenChange, onSuccess, t],
  );

  // Get the selected product - memoized
  const selectedProduct = useMemo(() => {
    const selectedProductId = form.watch('productId');
    return products.find((p) => p.id === selectedProductId);
  }, [form.watch('productId'), products]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="space-x-1">
          <span>{triggerText || t('createButton')}</span> <IconPlus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('editTitle') : t('createTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('editDescription') : t('createDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product selection (only for new batches) */}
            {!isEditing && (
              <ComboBoxFormField
                name="productId"
                label={t('product')}
                tooltip={TOOLTIPS.product}
                options={productOptions}
                control={form.control}
                disabled={isEditing}
                placeholder={t('selectProduct')}
                emptyMessage={t('noProductsFound')}
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
                      label={t('batchCode')}
                      tooltipContent={TOOLTIPS.batchCode}
                    />
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder={t('autoGeneratedBatchCode')}
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
                        title={t('generateNewBatchCode')}
                      >
                        <IconRefresh size={16} />
                      </Button>
                    )}
                  </div>
                  {!isEditing && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('batchCodeNote')}
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
                      label={t('expiryDate')}
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
                            <span>{t('pickDate')}</span>
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
                        label={t('initialQuantity')}
                        tooltipContent={TOOLTIPS.initialQuantity}
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('enterInitialQuantity')}
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
                      label={t('buyPrice')}
                      tooltipContent={TOOLTIPS.buyPrice}
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t('enterBuyPrice')}
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
                    {t('buyPriceNote')}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unit (only for new batches) */}
            {!isEditing && (
              <ComboBoxFormField
                name="unitId"
                label={t('unit')}
                tooltip={TOOLTIPS.unit}
                options={unitOptions}
                control={form.control}
                disabled={isEditing || !!selectedProduct}
                placeholder={t('selectUnit')}
                emptyMessage={t('noUnitsFound')}
                helperText={selectedProduct ? t('unitAutoSelected') : undefined}
              />
            )}

            {/* Supplier (only for new batches) */}
            {!isEditing && (
              <ComboBoxFormField
                name="supplierId"
                label={t('supplier')}
                tooltip={TOOLTIPS.supplier}
                options={supplierOptions}
                control={form.control}
                disabled={isEditing}
                placeholder={t('selectSupplier')}
                emptyMessage={t('noSuppliersFound')}
                transform={(value) => (value === 'none' ? null : value)}
              />
            )}

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange && onOpenChange(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? isEditing
                    ? t('updating')
                    : t('creating')
                  : isEditing
                    ? t('updateButton')
                    : t('createButton')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
