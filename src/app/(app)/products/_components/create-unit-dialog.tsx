'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProductForm } from './product-form-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { useToast } from '@/hooks/use-toast';
import { createUnit } from '../units/action';

export function CreateUnitDialog() {
  const t = useTranslations('product.createUnitDialog');
  const tCommon = useTranslations('common');
  const { openUnitCreate, setOpenUnitCreate, fetchOptions } = useProductForm();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formSchema = z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    symbol: z
      .string()
      .min(1, t('validation.symbolRequired'))
      .max(5, t('validation.symbolMaxLength')),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      symbol: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const result = await createUnit({
        name: values.name,
        symbol: values.symbol,
      });

      if (result.success) {
        toast({
          title: t('success'),
          description: t('successMessage'),
        });
        form.reset();
        setOpenUnitCreate(false);

        // Fetch updated units list
        await fetchOptions();
      } else {
        toast({
          title: tCommon('error'),
          description: result.error || t('failed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating unit:', error);
      toast({
        title: tCommon('error'),
        description: tCommon('unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={openUnitCreate} onOpenChange={setOpenUnitCreate}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
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
                  <FormLabel>{t('unitSymbol')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('unitSymbolPlaceholder')}
                      {...field}
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
                onClick={() => setOpenUnitCreate(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('creating') : t('createButton')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
