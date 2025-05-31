'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { CategoryWithCount } from '@/lib/types/category';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { IconPlus } from '@tabler/icons-react';
import { createCategory, updateCategory } from '../action';

interface CategoryFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: CategoryWithCount;
  onSuccess?: () => void;
}

export default function CategoryFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: CategoryFormDialogProps) {
  const t = useTranslations('category.formDialog');
  const tCommon = useTranslations('common');
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);

  // Define the form schema with translations
  const formSchema = z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    description: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  // Initialize the form with description
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        description: initialData.description || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
      });
    }
  }, [form, initialData]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      const result =
        isEditing && initialData
          ? await updateCategory(initialData.id, {
              name: values.name,
              description: values.description,
            })
          : await createCategory({
              name: values.name,
              description: values.description,
            });

      if (result.success) {
        toast({
          title: isEditing
            ? t('success.categoryUpdated')
            : t('success.categoryCreated'),
          description: isEditing
            ? t('success.categoryUpdatedMessage')
            : t('success.categoryCreatedMessage'),
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
      console.error('Category form submission error:', error);
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
                  <FormLabel>{t('description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('descriptionPlaceholder')}
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
