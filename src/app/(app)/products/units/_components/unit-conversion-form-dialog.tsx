'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { IconPlus } from '@tabler/icons-react';
import { UnitConversionWithUnits, UnitWithCounts } from '@/lib/types/unit';
import { createConversion, updateConversion } from '../conversion-actions';

// Form schema for unit conversion
const formSchema = z.object({
  fromUnitId: z.string().min(1, 'Source unit is required'),
  toUnitId: z.string().min(1, 'Target unit is required'),
  conversionFactor: z.coerce
    .number()
    .min(0.000001, 'Conversion factor must be positive')
    .max(1000000, 'Conversion factor is too large'),
});

type FormValues = z.infer<typeof formSchema>;

interface UnitConversionFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  units: UnitWithCounts[];
  initialData?: UnitConversionWithUnits;
  onSuccess?: () => void;
}

export default function UnitConversionFormDialog({
  open,
  onOpenChange,
  units,
  initialData,
  onSuccess,
}: UnitConversionFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromUnitId: initialData?.fromUnitId || '',
      toUnitId: initialData?.toUnitId || '',
      conversionFactor: initialData?.conversionFactor || 1,
    },
  });

  // Get selected units
  const fromUnitId = form.watch('fromUnitId');
  const toUnitId = form.watch('toUnitId');
  const fromUnit = units.find((u) => u.id === fromUnitId);
  const toUnit = units.find((u) => u.id === toUnitId);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        fromUnitId: initialData.fromUnitId,
        toUnitId: initialData.toUnitId,
        conversionFactor: initialData.conversionFactor,
      });
    } else {
      form.reset({
        fromUnitId: '',
        toUnitId: '',
        conversionFactor: 1,
      });
    }
  }, [form, initialData]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      if (values.fromUnitId === values.toUnitId) {
        form.setError('toUnitId', {
          type: 'manual',
          message: 'Source and target units cannot be the same',
        });
        setLoading(false);
        return;
      }

      const result =
        isEditing && initialData
          ? await updateConversion(initialData.id, {
              conversionFactor: values.conversionFactor,
            })
          : await createConversion({
              fromUnitId: values.fromUnitId,
              toUnitId: values.toUnitId,
              conversionFactor: values.conversionFactor,
            });

      if (result.success) {
        toast({
          title: isEditing ? 'Conversion updated' : 'Conversion created',
          description: isEditing
            ? 'Unit conversion has been updated successfully'
            : 'New unit conversion has been created',
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

  // Format the conversion explanation
  const conversionExplanation = () => {
    if (!fromUnit || !toUnit || !form.watch('conversionFactor')) return '';

    return `1 ${fromUnit.name} (${fromUnit.symbol}) = ${form.watch(
      'conversionFactor',
    )} ${toUnit.name} (${toUnit.symbol})`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="space-x-1">
          <span>Create Conversion</span> <IconPlus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Unit Conversion' : 'Create Unit Conversion'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edit the unit conversion factor below'
              : 'Define how units convert to each other in your inventory system'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fromUnitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Unit</FormLabel>
                  <Select
                    disabled={isEditing}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toUnitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Unit</FormLabel>
                  <Select
                    disabled={isEditing}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conversionFactor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conversion Factor</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Enter conversion factor"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground mt-1">
                    {conversionExplanation()}
                  </p>
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
                  <>{isEditing ? 'Update Conversion' : 'Create Conversion'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
