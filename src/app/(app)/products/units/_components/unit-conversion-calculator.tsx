'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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

interface UnitConversionCalculatorProps {
  units: UnitWithCounts[];
}

export default function UnitConversionCalculator({
  units,
}: UnitConversionCalculatorProps) {
  const t = useTranslations('unit.conversionCalculator');
  const [result, setResult] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  // Form schema with translations
  const formSchema = z.object({
    fromUnitId: z.string().min(1, t('validation.sourceUnitRequired')),
    toUnitId: z.string().min(1, t('validation.targetUnitRequired')),
    quantity: z.coerce.number().positive(t('validation.quantityPositive')),
  });

  type FormValues = z.infer<typeof formSchema>;

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
        const errorMessage = response.error || t('unableToConvert');
        setConversionError(errorMessage);

        toast({
          title: t('conversionFailed'),
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? `${t('failedToPerform')}: ${error.message}`
          : t('failedToPerform');

      setConversionError(errorMessage);

      toast({
        title: t('error'),
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
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
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
                    <FormLabel>{t('quantity')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder={t('quantityPlaceholder')}
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
                    <FormLabel>{t('fromUnit')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectSourceUnit')} />
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
                    <FormLabel>{t('toUnit')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectTargetUnit')} />
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
                {isCalculating ? t('calculating') : t('calculate')}
              </Button>
            </div>
          </form>
        </Form>

        {conversionError && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-lg font-medium text-destructive">
              {t('conversionError')}
            </p>
            <p className="text-destructive">{conversionError}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('conversionTip')}
            </p>
          </div>
        )}

        {result !== null && fromUnit && toUnit && (
          <div className="mt-6 p-4 bg-secondary/30 rounded-md">
            <p className="text-lg font-medium">{t('result')}</p>
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
