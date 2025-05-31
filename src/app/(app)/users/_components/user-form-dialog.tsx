'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types/user';
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
import { createUser } from '../action';

// Define the form schema with translated error messages
const createFormSchema = (t) =>
  z.object({
    name: z.string().min(1, t('fields.nameRequired')),
    email: z.string().email(t('fields.emailInvalid')),
    password: z
      .string()
      .min(8, t('fields.passwordMinLength'))
      .optional()
      .or(z.literal('')),
    role: z.string().optional(),
  });

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface UserFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: User;
  onSuccess?: () => void;
}

export default function UserFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: UserFormDialogProps) {
  const t = useTranslations('user.form');
  const tCommon = useTranslations('user.common');
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialData?.id);

  // Initialize the form with translated schema
  const form = useForm<FormValues>({
    resolver: zodResolver(createFormSchema(t)),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'user',
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '', // Don't prefill password
        role: initialData.role || 'user',
      });
    } else {
      form.reset({
        name: '',
        email: '',
        password: '',
        role: 'user',
      });
    }
  }, [form, initialData]);

  // Handle form submission with translations
  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        setLoading(true);

        if (isEditing) {
          toast({
            title: t('error.failed'),
            description: 'User editing is not implemented yet',
            variant: 'destructive',
          });
        } else {
          const result = await createUser({
            name: values.name,
            email: values.email,
            password: values.password || '',
            role: values.role as 'admin' | 'user' | undefined,
          });

          if (result.success) {
            toast({
              title: t('success.created'),
              description: t('success.created'),
            });

            form.reset();
            onSuccess?.();
          } else {
            toast({
              title: tCommon('error'),
              description: result.error || t('error.failed'),
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('Error creating user:', error);
        toast({
          title: tCommon('error'),
          description: t('error.unexpected'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [isEditing, form, onSuccess, t, tCommon],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="space-x-1">
          <span>{t('createButton')}</span> <IconPlus size={18} />
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('fields.emailPlaceholder')}
                      {...field}
                      disabled={isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEditing ? t('fields.newPassword') : t('fields.password')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        isEditing
                          ? t('fields.newPasswordPlaceholder')
                          : t('fields.passwordPlaceholder')
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.role')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('fields.rolePlaceholder')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">{t('roles.user')}</SelectItem>
                      <SelectItem value="admin">{t('roles.admin')}</SelectItem>
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
    </Dialog>
  );
}
