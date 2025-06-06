'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { User, UserRole } from '@/lib/types/user';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { setUserRole } from '../action';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { IconKey, IconShieldCheck, IconUser } from '@tabler/icons-react';

const formSchema = z.object({
  role: z.enum(['user', 'admin'], {
    required_error: 'Role is required',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSuccess?: () => void;
}

export function UserRoleDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserRoleDialogProps) {
  const t = useTranslations('user.roleDialog');
  const tCommon = useTranslations('user.common');
  const [loading, setLoading] = useState(false);

  // Initialize the form with properly typed role value
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: (user.role || 'user') as UserRole,
    },
  });

  // Handle form submission with translations
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      const result = await setUserRole({
        userId: user.id,
        role: values.role,
      });

      if (result.success) {
        toast({
          title: t('success'),
          description: t('successMessage', {
            name: user.name,
            role: values.role === 'admin' ? t('roles.admin') : t('roles.user'),
          }),
        });
        onSuccess?.();
      } else {
        toast({
          title: tCommon('error'),
          description: result.error || t('error.failed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: tCommon('error'),
        description: t('error.unexpected'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <IconKey className="mr-2" size={18} />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description', { name: user.name })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('selectRole')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-2 rounded-md border p-4">
                        <RadioGroupItem value="user" id="user" />
                        <Label htmlFor="user" className="flex items-center">
                          <IconUser className="mr-2 h-4 w-4" />
                          <div>
                            <div className="font-medium">{t('roles.user')}</div>
                            <div className="text-xs text-muted-foreground">
                              {t('roleDescriptions.user')}
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-md border p-4">
                        <RadioGroupItem value="admin" id="admin" />
                        <Label htmlFor="admin" className="flex items-center">
                          <IconShieldCheck className="mr-2 h-4 w-4" />
                          <div>
                            <div className="font-medium">
                              {t('roles.admin')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {t('roleDescriptions.admin')}
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('updating') : t('updateRole')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
