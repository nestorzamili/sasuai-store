'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { RewardWithClaimCount } from '@/lib/types/reward';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { IconPlus } from '@tabler/icons-react';
import { createReward, updateReward } from '../actions';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { RewardImageUpload } from './reward-image-upload';

interface RewardFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: RewardWithClaimCount;
  onSuccess?: () => void;
  showTrigger?: boolean;
}

export default function RewardFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
  showTrigger = false,
}: RewardFormDialogProps) {
  const t = useTranslations('reward.form');
  const tValidation = useTranslations('reward.validation');
  const [loading, setLoading] = useState(false);

  const isEditing = useMemo(() => Boolean(initialData?.id), [initialData?.id]);

  // Enhanced form schema with translated validation messages
  const formSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .min(1, tValidation('required'))
          .max(100, tValidation('maxValue', { max: 100 })),
        pointsCost: z.coerce
          .number()
          .min(1, t('fields.pointsCostMin'))
          .max(1000000, tValidation('maxValue', { max: 1000000 })),
        stock: z.coerce
          .number()
          .min(0, t('fields.stockMin'))
          .max(10000, tValidation('maxValue', { max: 10000 })),
        isActive: z.boolean().default(true),
        description: z.string().optional(),
        imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
        expiryDate: z.date().optional(),
      }),
    [t, tValidation],
  );

  // Add the FormValues type after formSchema is defined
  type FormValues = z.infer<typeof formSchema>;

  // Memoized default values to prevent unnecessary re-renders
  const defaultValues = useMemo(
    (): FormValues => ({
      name: initialData?.name || '',
      pointsCost: initialData?.pointsCost || 100,
      stock: initialData?.stock || 10,
      isActive: initialData?.isActive ?? true,
      description: initialData?.description || '',
      imageUrl: initialData?.imageUrl || '',
      expiryDate: initialData?.expiryDate
        ? new Date(initialData.expiryDate)
        : undefined,
    }),
    [initialData],
  );

  // Initialize the form with memoized resolver
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Optimized form reset effect
  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  // Memoized date validation
  const validateExpiryDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiryDate = new Date(date);
    expiryDate.setHours(0, 0, 0, 0);

    return expiryDate >= today;
  };

  // Optimized form submission with translated messages
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      // Validate expiry date with translated message
      if (values.expiryDate && !validateExpiryDate(values.expiryDate)) {
        toast({
          title: t('error.failed'),
          description: tValidation('invalidDate'),
          variant: 'destructive',
        });
        return;
      }

      const submitData = {
        name: values.name,
        pointsCost: values.pointsCost,
        stock: values.stock,
        isActive: values.isActive,
        description: values.description || undefined,
        imageUrl: values.imageUrl || undefined,
        expiryDate: values.expiryDate,
      };

      const result =
        isEditing && initialData
          ? await updateReward(initialData.id, submitData)
          : await createReward(submitData);

      if (result.success) {
        toast({
          title: isEditing ? t('success.updated') : t('success.created'),
          description: isEditing ? t('success.updated') : t('success.created'),
        });

        form.reset();
        onSuccess?.();
      } else {
        toast({
          title: t('error.failed'),
          description: result.error || t('error.unexpected'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Reward form submission error:', error);
      toast({
        title: t('error.failed'),
        description: t('error.unexpected'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Optimized image change handler
  const handleImageChange = (imageUrl: string) => {
    form.setValue('imageUrl', imageUrl);
    form.trigger('imageUrl');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="default" className="space-x-1">
            <span>{t('createTitle')}</span> <IconPlus size={18} />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[850px] p-0 gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {isEditing ? t('editTitle') : t('createTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('editDescription') : t('createDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            {/* Scrollable content area with side-by-side layout */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left side - Image upload */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="md:w-[280px] flex-shrink-0">
                      <FormLabel>{t('fields.image')}</FormLabel>
                      <FormControl>
                        <RewardImageUpload
                          currentImage={field.value || ''}
                          name={form.getValues('name')}
                          onImageChange={handleImageChange}
                        />
                      </FormControl>
                      <FormDescription className="mt-2 text-xs">
                        {t('fields.imageDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Right side - Form fields */}
                <div className="flex-1 space-y-5">
                  {/* Basic Information Section */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      {t('sections.basicInfo')}
                    </h3>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('fields.name')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('fields.namePlaceholder')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('fields.description')}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t('fields.descriptionPlaceholder')}
                                className="resize-none h-[80px]"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              {t('fields.descriptionHelper')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Reward Value Section */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      {t('sections.rewardValue')}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pointsCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('fields.pointsCost')}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t('fields.pointsCostPlaceholder')}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('fields.stock')}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t('fields.stockPlaceholder')}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Availability Section */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      {t('sections.availability')}
                    </h3>

                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('fields.expiryDate')}</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground',
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>
                                      {t('fields.expiryDatePlaceholder')}
                                    </span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date <
                                  new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                {t('fields.isActive')}
                              </FormLabel>
                              <FormDescription>
                                {t('fields.isActiveDescription')}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed footer with action buttons */}
            <div className="p-4 border-t flex flex-row justify-end gap-2 mt-auto">
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
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
