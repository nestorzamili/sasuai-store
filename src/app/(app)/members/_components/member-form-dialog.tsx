'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { MemberFormDialogProps } from '@/lib/types/member';
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
import { createMember, updateMember } from '../action';

export default function MemberFormDialog({
  open,
  onOpenChange,
  initialData,
  tiers,
  onSuccess,
}: MemberFormDialogProps) {
  const t = useTranslations('member.formDialog');
  const tCommon = useTranslations('member.common');
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);

  // Define the form schema with translated error messages
  const memberFormSchema = z.object({
    cardId: z.string().min(1, t('validation.cardIdRequired')),
    name: z.string().min(1, t('validation.nameRequired')),
    email: z
      .string()
      .email(t('validation.invalidEmail'))
      .optional()
      .or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    phone: z
      .string()
      .min(10, 'Phone number is required')
      .max(14, 'Phone number is too long')
      .regex(/^(08|62)/, "Phone number must start with '08' or '62'"),
    tierId: z.string().optional().or(z.literal('')),
  });

  type FormValues = z.infer<typeof memberFormSchema>;

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      cardId: initialData?.cardId || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      phone: initialData?.phone || '',
      tierId: initialData?.tierId || '',
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        cardId: initialData.cardId || '',
        name: initialData.name || '',
        email: initialData.email || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        tierId: initialData.tierId || '',
      });
    } else {
      form.reset({
        name: '',
        cardId: '',
        address: '',
        email: '',
        phone: '',
        tierId: '',
      });
    }
  }, [form, initialData]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      const result =
        isEditing && initialData
          ? await updateMember(initialData.id, {
              name: values.name,
              cardId: values.cardId || null,
              address: values.address || null,
              email: values.email || null,
              phone: values.phone || null,
              tierId: values.tierId || null,
            })
          : await createMember({
              name: values.name,
              email: values.email || null,
              cardId: values.cardId || null,
              address: values.address || null,
              phone: values.phone || null,
              tierId: values.tierId || null,
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
      console.error('Failed to submit member form:', error);
      toast({
        title: tCommon('error'),
        description: tCommon('unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create dialog content
  const dialogContent = (
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
            name="cardId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.cardId')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.cardId')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.name')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.email')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('placeholders.email')}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.phone')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('placeholders.phone')}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.address')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('placeholders.address')}
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fields.tier')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || ''}
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('placeholders.tier')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiers.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        {tier.name} ({tier.minPoints} {t('points')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Only show trigger button when it's for creating a new member */}
      {!isEditing && (
        <DialogTrigger asChild>
          <Button variant="default" className="space-x-1">
            <span>{t('createTrigger')}</span> <IconPlus size={18} />
          </Button>
        </DialogTrigger>
      )}
      {dialogContent}
    </Dialog>
  );
}
