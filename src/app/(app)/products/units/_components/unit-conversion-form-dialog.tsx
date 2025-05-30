'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('unit.conversionFormDialog');
  const tCommon = useTranslations('common');
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);

  // Form schema with translations
  const formSchema = z.object({
    fromUnitId: z.string().min(1, t('validation.sourceUnitRequired')),
    toUnitId: z.string().min(1, t('validation.targetUnitRequired')),
    conversionFactor: z.coerce
      .number()
      .min(0.000001, t('validation.factorPositive'))
      .max(1000000, t('validation.factorTooLarge')),
  });

  type FormValues = z.infer<typeof formSchema>;

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromUnitId: initialData?.fromUnit.id || '',
      toUnitId: initialData?.toUnit.id || '',
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
        fromUnitId: initialData.fromUnit.id,
        toUnitId: initialData.toUnit.id,
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
          message: t('error.sameUnits'),
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
          title: isEditing
            ? t('success.conversionUpdated')
            : t('success.conversionCreated'),
          description: isEditing
            ? t('success.conversionUpdatedMessage')
            : t('success.conversionCreatedMessage'),
        });

        form.reset();
        onSuccess?.();
      } else {
        toast({
          title: tCommon('error'),
          description: result.error || t('error.somethingWrong'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Unit conversion form submission error:', error);
      toast({
        title: tCommon('error'),
        description: t('error.unexpectedError'),
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
          <span>{t('createConversion')}</span> <IconPlus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
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
            <FormField
              control={form.control}
              name="fromUnitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('sourceUnit')}</FormLabel>
                  <Select
                    disabled={isEditing}
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

            <FormField
              control={form.control}
              name="toUnitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('targetUnit')}</FormLabel>
                  <Select
                    disabled={isEditing}
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

            <FormField
              control={form.control}
              name="conversionFactor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('conversionFactor')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder={t('conversionFactorPlaceholder')}
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
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>{isEditing ? t('updating') : t('creating')}</>
                ) : (
                  <>{isEditing ? t('updateButton') : t('createButton')}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
