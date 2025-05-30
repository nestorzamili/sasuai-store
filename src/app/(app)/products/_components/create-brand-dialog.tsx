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
import { createBrand } from '../brands/action';

export function CreateBrandDialog() {
  const t = useTranslations('product.createBrandDialog');
  const tCommon = useTranslations('common');
  const { openBrandCreate, setOpenBrandCreate, fetchOptions } =
    useProductForm();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formSchema = z.object({
    name: z.string().min(1, t('validation.nameRequired')),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const result = await createBrand({
        name: values.name,
      });

      if (result.success) {
        toast({
          title: t('success'),
          description: t('successMessage'),
        });
        form.reset();
        setOpenBrandCreate(false);

        // Fetch updated brands list
        await fetchOptions();
      } else {
        toast({
          title: tCommon('error'),
          description: result.error || t('failed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating brand:', error);
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
    <Dialog open={openBrandCreate} onOpenChange={setOpenBrandCreate}>
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
                  <FormLabel>{t('brandName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('brandNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpenBrandCreate(false)}
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
