'use client';

import { HTMLAttributes, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/password-input';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useToast } from '@/hooks/use-toast';
type ResetFormProps = HTMLAttributes<HTMLDivElement> & {
  token: string;
};

export function ResetForm({ className, token, ...props }: ResetFormProps) {
  const t = useTranslations('auth.resetPasswordForm');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const formSchema = z
    .object({
      password: z
        .string()
        .trim()
        .min(8, { message: t('validation.passwordMinLength') })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/, {
          message: t('validation.passwordComplexity'),
        }),
      confirmPassword: z
        .string()
        .min(1, { message: t('validation.confirmPasswordRequired') }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordsDontMatch'),
      path: ['confirmPassword'],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (resetError) {
        // Get a safe error message
        const errorMessage =
          typeof resetError.message === 'string'
            ? resetError.message
            : t('messages.failedToReset');

        toast({
          title: t('messages.error'),
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      // Success path
      toast({
        title: t('messages.success'),
        description: t('messages.passwordResetSuccess'),
      });

      // Redirect to login after a brief delay
      setTimeout(() => {
        router.push('/sign-in?success=password_reset');
      }, 1500);
    } catch (error) {
      console.error('Error during password reset:', error);
      toast({
        title: t('messages.error'),
        description: t('messages.unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn('w-full', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="grid gap-3 sm:gap-4 w-full">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-1.5 w-full">
                  <FormLabel className="text-sm sm:text-base">
                    {t('newPassword')}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder={t('passwordPlaceholder')}
                      {...field}
                      className="h-9 sm:h-10 text-sm sm:text-base w-full"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-1.5 w-full">
                  <FormLabel className="text-sm sm:text-base">
                    {t('confirmPassword')}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder={t('passwordPlaceholder')}
                      {...field}
                      className="h-9 sm:h-10 text-sm sm:text-base w-full"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <Button
              className="mt-1 sm:mt-2 h-9 sm:h-10 text-sm sm:text-base font-medium w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? t('resetting') : t('resetPassword')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
