'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { MemberTier } from '@/lib/types/member';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { createMemberTier, updateMemberTier } from '../action';

interface TierFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: MemberTier;
  onSuccess?: () => void;
}

export default function TierFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: TierFormDialogProps) {
  const t = useTranslations('member.tierFormDialog');
  const tCommon = useTranslations('member.common');
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);

  // Form schema for tier with translated validation messages
  const tierFormSchema = z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    minPoints: z.coerce
      .number()
      .int()
      .min(0, t('validation.minPointsNonNegative')),
    multiplier: z.coerce.number().min(0.1, t('validation.multiplierMin')),
  });

  type FormValues = z.infer<typeof tierFormSchema>;

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(tierFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      minPoints: initialData?.minPoints || 0,
      multiplier: initialData?.multiplier || 1,
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        minPoints: initialData.minPoints,
        multiplier: initialData.multiplier,
      });
    } else {
      form.reset({
        name: '',
        minPoints: 0,
        multiplier: 1,
      });
    }
  }, [form, initialData]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      const result =
        isEditing && initialData
          ? await updateMemberTier(initialData.id, {
              name: values.name,
              minPoints: values.minPoints,
              multiplier: values.multiplier,
            })
          : await createMemberTier({
              name: values.name,
              minPoints: values.minPoints,
              multiplier: values.multiplier,
            });

      if (result.success) {
        toast({
          title: isEditing ? t('updateSuccess') : t('createSuccess'),
          description: isEditing
            ? t('updateSuccessMessage')
            : t('createSuccessMessage'),
        });

        form.reset();
        onSuccess?.();
      } else {
        toast({
          title: tCommon('error'),
          description: result.error || tCommon('somethingWrong'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save member tier:', error);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  <FormLabel>{t('fields.name.label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('fields.name.placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('fields.name.description')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.minPoints.label')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t('fields.minPoints.placeholder')}
                      value={field.value === 0 ? '' : field.value}
                      onFocus={(e) => {
                        if (e.target.value === '0') {
                          e.target.value = '';
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '') {
                          e.target.value = '0';
                          field.onChange(0);
                        }
                      }}
                      onChange={(e) => {
                        const value =
                          e.target.value === '' ? 0 : Number(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('fields.minPoints.description')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="multiplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.multiplier.label')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="1.0"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('fields.multiplier.description')}
                  </FormDescription>
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
                {tCommon('cancel')}
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
