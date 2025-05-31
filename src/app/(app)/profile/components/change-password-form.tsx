import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
import { authClient } from '@/lib/auth-client';
import { useState, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ChangePasswordForm() {
  const t = useTranslations('profile.changePassword');
  const router = useRouter();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Enhanced password validation schema with translations
  const passwordFormSchema = z
    .object({
      currentPassword: z
        .string()
        .trim()
        .min(8, { message: t('validation.currentPasswordMinLength') }),
      newPassword: z
        .string()
        .trim()
        .min(8, { message: t('validation.newPasswordMinLength') })
        .refine(
          (password) => {
            const complexityRegex =
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
            return complexityRegex.test(password);
          },
          {
            message: t('validation.passwordComplexity'),
          },
        ),
      confirmPassword: z.string().trim(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('validation.passwordsDontMatch'),
      path: ['confirmPassword'],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: t('validation.passwordMustBeDifferent'),
      path: ['newPassword'],
    });

  type PasswordFormValues = z.infer<typeof passwordFormSchema>;

  // Password change form with improved configuration
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur', // Validate on field blur for better UX
  });

  // Memoized form validation check
  const formValidation = useMemo(() => {
    const { currentPassword, newPassword, confirmPassword } = form.getValues();
    return {
      hasValues: Boolean(currentPassword && newPassword && confirmPassword),
      isValid: form.formState.isValid,
    };
  }, [form]);

  // Centralized error handling for password change
  const handlePasswordChangeError = useCallback(
    (errorMessage: string) => {
      if (
        ['invalid password', 'incorrect password', 'wrong password'].some(
          (err) => errorMessage.toLowerCase().includes(err),
        )
      ) {
        setPasswordError(t('currentPasswordIncorrect'));
        form.setFocus('currentPassword');
      } else {
        toast({
          title: t('passwordChangeFailed'),
          description: errorMessage || t('problemChanging'),
          variant: 'destructive',
        });
      }
    },
    [form, t],
  );

  // Handle password change
  const onSubmit = useCallback(
    async (data: PasswordFormValues) => {
      setIsChangingPassword(true);
      setPasswordError(null);

      try {
        await authClient.changePassword(
          {
            newPassword: data.newPassword,
            currentPassword: data.currentPassword,
            revokeOtherSessions: true,
          },
          {
            onSuccess: () => {
              toast({
                title: t('passwordChangeSuccess'),
                description: t('passwordChangeSuccessMessage'),
              });
              form.reset();
              router.refresh();
            },
            onError: (ctx) => {
              handlePasswordChangeError(ctx.error?.message || '');
            },
          },
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'An unknown error occurred';

        toast({
          title: t('passwordChangeFailed'),
          description: errorMessage || t('problemChanging'),
          variant: 'destructive',
        });
      } finally {
        setIsChangingPassword(false);
      }
    },
    [form, router, handlePasswordChangeError, t],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {passwordError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{passwordError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Password field */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('currentPassword')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password field */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('newPassword')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormDescription>{t('passwordRequirements')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirmPassword')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={
                isChangingPassword ||
                !formValidation.hasValues ||
                !formValidation.isValid
              }
            >
              {isChangingPassword
                ? t('changingPassword')
                : t('changePasswordButton')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
