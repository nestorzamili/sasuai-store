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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createCategory } from '../categories/action';

export function CreateCategoryDialog() {
  const t = useTranslations('product.createCategoryDialog');
  const tCommon = useTranslations('common');
  const { openCategoryCreate, setOpenCategoryCreate, fetchOptions } =
    useProductForm();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formSchema = z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    description: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const result = await createCategory({
        name: values.name,
        description: values.description,
      });

      if (result.success) {
        toast({
          title: t('success'),
          description: t('successMessage'),
        });
        form.reset();
        setOpenCategoryCreate(false);

        // Fetch updated categories list
        await fetchOptions();
      } else {
        toast({
          title: tCommon('error'),
          description: result.error || t('failed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating category:', error);
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
    <Dialog open={openCategoryCreate} onOpenChange={setOpenCategoryCreate}>
      <DialogContent className="sm:max-w-[500px]">
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
                  <FormLabel>{t('categoryName')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('categoryNamePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categoryDescription')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('categoryDescriptionPlaceholder')}
                      className="resize-none"
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
                onClick={() => setOpenCategoryCreate(false)}
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
