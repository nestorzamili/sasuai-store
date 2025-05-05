'use client';

import React from 'react';
import { useState } from 'react';
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
import { ProductBatchWithProduct } from '@/lib/types/product-batch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { UnitWithCounts } from '@/lib/types/unit';
import { format } from 'date-fns';
import { IconInfoCircle } from '@tabler/icons-react';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ComboBox, ComboBoxOption } from '@/components/ui/combobox';
import { createStockIn, createStockOut } from '../stock-actions';

// Form schema for batch adjustment
const formSchema = z.object({
  adjustmentType: z.enum(['add', 'remove']),
  quantity: z.coerce.number().int().positive('Quantity must be positive'),
  unitId: z.string().min(1, 'Unit is required'),
  reason: z.string().min(3, 'Reason is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface BatchAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: ProductBatchWithProduct;
  units: UnitWithCounts[];
  onSuccess?: () => void;
}

export function BatchAdjustmentDialog({
  open,
  onOpenChange,
  batch,
  units,
  onSuccess,
}: BatchAdjustmentDialogProps) {
  const [loading, setLoading] = useState(false);

  // Convert units to ComboBox options
  const unitOptions: ComboBoxOption[] = React.useMemo(() => {
    return units.map((unit) => ({
      value: unit.id,
      label: `${unit.name} (${unit.symbol})`,
    }));
  }, [units]);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adjustmentType: 'add',
      quantity: 1,
      unitId: batch?.product?.unitId || '',
      reason: '',
    },
  });

  // Get the selected adjustment type
  const adjustmentType = form.watch('adjustmentType');
  const quantity = form.watch('quantity');

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      let result;
      if (values.adjustmentType === 'add') {
        // Create a stock-in record using StockMovementService
        result = await createStockIn({
          batchId: batch.id,
          quantity: values.quantity,
          unitId: values.unitId,
          date: new Date(),
          // We don't include a supplier for manual adjustments
        });
      } else {
        // Check if removing more than available
        if (values.quantity > batch.remainingQuantity) {
          toast({
            title: 'Invalid adjustment',
            description: `Cannot remove more than the remaining quantity (${batch.remainingQuantity})`,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        // Create a stock-out record using StockMovementService
        result = await createStockOut({
          batchId: batch.id,
          quantity: values.quantity,
          unitId: values.unitId,
          date: new Date(),
          reason: values.reason,
        });
      }

      if (result.success) {
        toast({
          title: 'Batch adjusted',
          description: `Successfully ${
            values.adjustmentType === 'add' ? 'added' : 'removed'
          } ${values.quantity} units to batch`,
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

  // Format the expiry date
  const formattedExpiryDate = format(new Date(batch.expiryDate), 'PPP');

  // Calculate new quantity after adjustment
  const newQuantity =
    adjustmentType === 'add'
      ? batch.remainingQuantity + quantity
      : batch.remainingQuantity - quantity;

  // Check if the batch is expired
  const isExpired = new Date(batch.expiryDate) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Adjust Batch Quantity</DialogTitle>
          <DialogDescription>
            Adjust the quantity for batch {batch.batchCode} of{' '}
            {batch.product.name}
          </DialogDescription>
        </DialogHeader>

        {/* Batch info */}
        <div className="bg-muted/50 p-3 rounded-md space-y-1 text-sm">
          <p>
            <span className="font-semibold">Product:</span> {batch.product.name}
          </p>
          <p>
            <span className="font-semibold">Batch Code:</span> {batch.batchCode}
          </p>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Expiry Date:</span>{' '}
            {formattedExpiryDate}
            {isExpired && (
              <span className="text-destructive text-xs font-medium bg-destructive/10 px-2 py-0.5 rounded">
                Expired
              </span>
            )}
          </div>
          <p>
            <span className="font-semibold">Current Quantity:</span>{' '}
            {batch.remainingQuantity}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="adjustmentType"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Adjustment Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="add" id="add" />
                        <label
                          htmlFor="add"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Add Stock
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="remove" id="remove" />
                        <label
                          htmlFor="remove"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remove Stock
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter quantity"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? '' : parseInt(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {adjustmentType === 'remove' &&
                      quantity > batch.remainingQuantity && (
                        <p className="text-destructive text-xs mt-1">
                          Cannot remove more than available quantity
                        </p>
                      )}
                  </FormItem>
                )}
              />

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
                        emptyMessage="No units found"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Reason</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Provide a reason for this adjustment for tracking
                            purposes.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder={
                        adjustmentType === 'add'
                          ? 'E.g., Additional purchase, correction, return'
                          : 'E.g., Damaged items, correction, waste'
                      }
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-accent/50 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">New Quantity:</span>
                <span className="font-semibold text-lg">
                  {newQuantity >= 0 ? newQuantity : 0}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  loading ||
                  (adjustmentType === 'remove' &&
                    quantity > batch.remainingQuantity) ||
                  !form.formState.isValid
                }
              >
                {loading ? 'Processing...' : 'Adjust Quantity'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
