import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

// Enhanced password validation schema
const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .min(8, { message: 'Current password must be at least 8 characters' }),
    newPassword: z
      .string()
      .trim()
      .min(8, { message: 'New password must be at least 8 characters' })
      .refine(
        (password) => {
          // Optional: Add password complexity requirements
          const complexityRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
          return complexityRegex.test(password);
        },
        {
          message:
            'Password must include uppercase, lowercase, number, and special character',
        },
      ),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function ChangePasswordForm() {
  const router = useRouter();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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
        setPasswordError('The current password you entered is incorrect.');
        form.setFocus('currentPassword');
      } else {
        toast({
          title: 'Password change failed',
          description:
            errorMessage || 'There was a problem changing your password.',
          variant: 'destructive',
        });
      }
    },
    [form],
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
                title: 'Password changed successfully',
                description:
                  'Your password has been updated and other sessions have been logged out.',
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
        // Extract error message safely with type narrowing
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'An unknown error occurred';

        toast({
          title: 'Password change failed',
          description:
            errorMessage || 'There was a problem changing your password.',
          variant: 'destructive',
        });
      } finally {
        setIsChangingPassword(false);
      }
    },
    [form, router, handlePasswordChangeError],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your account password securely</CardDescription>
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
                  <FormLabel>Current Password</FormLabel>
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
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormDescription>
                    Password must be at least 8 characters, include uppercase,
                    lowercase, number, and special character
                  </FormDescription>
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
                  <FormLabel>Confirm Password</FormLabel>
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
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
