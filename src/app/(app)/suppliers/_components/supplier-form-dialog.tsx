'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { createSupplier, updateSupplier } from '../action';
import { SupplierFormInitialData } from '@/lib/types/supplier';

interface SupplierFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: SupplierFormInitialData;
  onSuccess?: () => void;
  trigger?: boolean;
}

export default function SupplierFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
  trigger = false,
}: SupplierFormDialogProps) {
  const t = useTranslations('supplier');
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled
    ? (value: boolean) => {
        onOpenChange?.(value);
      }
    : setInternalOpen;

  const isEditing = Boolean(initialData?.id);

  // Form schema with translations
  const formSchema = z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    contact: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      contact: '',
    },
  });

  // Update form when initialData or open status changes
  useEffect(() => {
    if (isOpen) {
      // Only update form when dialog is open
      form.reset({
        name: initialData?.name || '',
        contact: initialData?.contact || '',
      });
    } else if (!isOpen && form.formState.isDirty) {
      // Reset form when dialog closes
      form.reset();
    }
  }, [form, initialData, isOpen]);

  // Handle form submission
  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        setLoading(true);

        const result =
          isEditing && initialData
            ? await updateSupplier(initialData.id, {
                name: values.name,
                contact: values.contact,
              })
            : await createSupplier({
                name: values.name,
                contact: values.contact,
              });

        if (result.success) {
          toast({
            title: isEditing
              ? t('success.supplierUpdated')
              : t('success.supplierCreated'),
            description: isEditing
              ? t('success.supplierUpdatedMessage')
              : t('success.supplierCreatedMessage'),
          });

          form.reset();
          onSuccess?.();
          setIsOpen(false);
        } else {
          toast({
            title: t('error.somethingWrong'),
            description: result.error || t('error.somethingWrong'),
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error creating/updating supplier:', error);
        toast({
          title: t('error.somethingWrong'),
          description: t('error.unexpectedError'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [isEditing, initialData, form, onSuccess, setIsOpen, t],
  );

  const handleOpenChange = useCallback(
    (value: boolean) => {
      setIsOpen(value);
      // If dialog is closing, reset form
      if (!value) {
        form.reset();
      }
    },
    [setIsOpen, form],
  );

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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('namePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('contact')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('contactPlaceholder')}
                    {...field}
                    value={field.value || ''}
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
              onClick={() => handleOpenChange(false)}
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
  );

  // If trigger prop is true, render a button that triggers the dialog
  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="default" className="space-x-1">
            <span>{t('create')}</span> <IconPlus size={18} />
          </Button>
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  // Otherwise, just render the dialog with external control
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
}
