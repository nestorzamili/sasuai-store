'use client';

import { HTMLAttributes, useState, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/password-input';
import { authClient } from '@/lib/auth-client';
import { useToast } from '@/hooks/use-toast';
import { extractErrorMessage } from '@/lib/error-handler';
import { AuthLink } from '@/components/auth/auth-footers';

type SignUpFormProps = HTMLAttributes<HTMLDivElement>;

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const t = useTranslations('auth.signUpForm');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Enhanced form validation schema
  const formSchema = z
    .object({
      name: z
        .string()
        .trim()
        .min(3, { message: t('validation.nameMinLength') })
        .max(50, { message: t('validation.nameMaxLength') })
        .regex(/^[a-zA-Z\s'-]+$/, {
          message: t('validation.nameInvalidChars'),
        }),
      email: z
        .string()
        .trim()
        .min(1, { message: t('validation.emailRequired') })
        .email({ message: t('validation.emailInvalid') }),
      password: z
        .string()
        .trim()
        .min(8, { message: t('validation.passwordMinLength') })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/, {
          message: t('validation.passwordComplexity'),
        }),
      confirmPassword: z.string().trim(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordsDontMatch'),
      path: ['confirmPassword'],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur', // Validate on field blur for better UX
  });

  // Watch form values to trigger re-computation
  const watchedValues = form.watch();

  // Optimized form validation check with proper dependencies
  const isSubmitDisabled = useMemo(() => {
    const { isValid, isDirty } = form.formState;
    const hasAllFields = Object.values(watchedValues).every(
      (value) => typeof value === 'string' && value.trim().length > 0,
    );

    return isLoading || !isValid || !isDirty || !hasAllFields;
  }, [isLoading, form.formState, watchedValues]);

  // Sign-up submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const { name, email, password } = values;

    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: '/sign-in',
      });

      if (error) {
        toast({
          title: t('messages.registrationFailed'),
          description: extractErrorMessage(error),
          variant: 'destructive',
        });
      } else {
        form.reset();
        toast({
          title: t('messages.registrationSuccessful'),
          description: t('messages.checkEmailVerification'),
        });
      }
    } catch (err) {
      toast({
        title: t('messages.error'),
        description: extractErrorMessage(err),
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
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-1.5 w-full">
                  <FormLabel className="text-sm sm:text-base">
                    {t('fullName')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('fullNamePlaceholder')}
                      className="h-9 sm:h-10 text-sm sm:text-base w-full"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-1.5 w-full">
                  <FormLabel className="text-sm sm:text-base">
                    {t('email')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('emailPlaceholder')}
                      className="h-9 sm:h-10 text-sm sm:text-base w-full"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-1.5 w-full">
                  <FormLabel className="text-sm sm:text-base">
                    {t('password')}
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder={t('passwordPlaceholder')}
                      className="h-9 sm:h-10 text-sm sm:text-base w-full"
                      {...field}
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
                      className="h-9 sm:h-10 text-sm sm:text-base w-full"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <Button
              className="mt-1 mb-2 sm:mt-2 h-9 sm:h-11 text-sm sm:text-base font-medium w-full"
              disabled={isSubmitDisabled}
              type="submit"
            >
              {isLoading ? t('creatingAccount') : t('createAccount')}
            </Button>
          </div>
        </form>
      </Form>
      <AuthLink
        question={t('alreadyHaveAccount')}
        linkText={t('signIn')}
        href="/sign-in"
      />
    </div>
  );
}
