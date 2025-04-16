'use client';

import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { UnitWithCounts } from '@/lib/types/unit';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { IconArrowRight, IconCalculator } from '@tabler/icons-react';
import { convertQuantity } from '../conversion-actions';

// Form schema for conversion calculator
const formSchema = z.object({
  fromUnitId: z.string().min(1, 'Source unit is required'),
  toUnitId: z.string().min(1, 'Target unit is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

interface UnitConversionCalculatorProps {
  units: UnitWithCounts[];
}

export default function UnitConversionCalculator({
  units,
}: UnitConversionCalculatorProps) {
  const [result, setResult] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromUnitId: '',
      toUnitId: '',
      quantity: 1,
    },
  });

  // Get selected units
  const fromUnitId = form.watch('fromUnitId');
  const toUnitId = form.watch('toUnitId');
  const quantity = form.watch('quantity');
  const fromUnit = units.find((u) => u.id === fromUnitId);
  const toUnit = units.find((u) => u.id === toUnitId);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsCalculating(true);
    setConversionError(null);
    setResult(null);

    try {
      if (values.fromUnitId === values.toUnitId) {
        setResult(values.quantity); // No conversion needed if units are the same
        setIsCalculating(false);
        return;
      }

      const response = await convertQuantity(
        values.fromUnitId,
        values.toUnitId,
        values.quantity,
      );

      if (response.success && response.data !== undefined) {
        setResult(response.data);
      } else {
        const errorMessage =
          response.error || 'Unable to convert between these units';
        setConversionError(errorMessage);

        toast({
          title: 'Conversion Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? `Failed to convert: ${error.message}`
          : 'Failed to perform unit conversion';

      setConversionError(errorMessage);

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCalculator className="h-5 w-5" />
          Unit Conversion Calculator
        </CardTitle>
        <CardDescription>
          Convert quantities between different units of measurement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Enter quantity"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fromUnitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Unit</FormLabel>
                    <Select
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

              <div className="flex items-center justify-center">
                <IconArrowRight className="h-6 w-6" />
              </div>

              <FormField
                control={form.control}
                name="toUnitId"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-1">
                    <FormLabel>To Unit</FormLabel>
                    <Select
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

              <Button
                type="submit"
                disabled={isCalculating || !fromUnitId || !toUnitId}
                className="w-full md:w-auto"
              >
                {isCalculating ? 'Calculating...' : 'Calculate'}
              </Button>
            </div>
          </form>
        </Form>

        {conversionError && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-lg font-medium text-destructive">
              Conversion Error
            </p>
            <p className="text-destructive">{conversionError}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Tip: Make sure you have defined a conversion between these units
              in the "Unit Conversions" tab.
            </p>
          </div>
        )}

        {result !== null && fromUnit && toUnit && (
          <div className="mt-6 p-4 bg-secondary/30 rounded-md">
            <p className="text-lg font-medium">Result:</p>
            <p className="text-2xl font-semibold">
              {quantity} {fromUnit.name} ({fromUnit.symbol}) ={' '}
              {result.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 6,
              })}{' '}
              {toUnit.name} ({toUnit.symbol})
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
