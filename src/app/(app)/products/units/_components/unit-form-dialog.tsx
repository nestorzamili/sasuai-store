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
import { toast } from '@/hooks/use-toast';
import { IconPlus } from '@tabler/icons-react';
import { UnitWithCounts } from '@/lib/types/unit';
import { createUnit, updateUnit } from '../action';

interface UnitFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: UnitWithCounts;
  onSuccess?: () => void;
}

export default function UnitFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: UnitFormDialogProps) {
  const t = useTranslations('unit.formDialog');
  const tCommon = useTranslations('common');
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);

  // Form schema with translations
  const formSchema = z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    symbol: z.string().min(1, t('validation.symbolRequired')),
  });

  type FormValues = z.infer<typeof formSchema>;

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      symbol: initialData?.symbol || '',
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        symbol: initialData.symbol || '',
      });
    } else {
      form.reset({
        name: '',
        symbol: '',
      });
    }
  }, [form, initialData]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      const result =
        isEditing && initialData
          ? await updateUnit(initialData.id, {
              name: values.name,
              symbol: values.symbol,
            })
          : await createUnit({
              name: values.name,
              symbol: values.symbol,
            });

      if (result.success) {
        toast({
          title: isEditing
            ? t('success.unitUpdated')
            : t('success.unitCreated'),
          description: isEditing
            ? t('success.unitUpdatedMessage')
            : t('success.unitCreatedMessage'),
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
      console.error('Unit form submission error:', error);
      toast({
        title: tCommon('error'),
        description: t('error.unexpectedError'),
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
          <span>{t('create')}</span> <IconPlus size={18} />
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('unitName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('unitNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('symbol')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('symbolPlaceholder')} {...field} />
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
