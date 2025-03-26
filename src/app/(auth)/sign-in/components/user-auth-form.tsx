'use client';

import { HTMLAttributes, useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconBrandFacebook, IconBrandGithub } from '@tabler/icons-react';
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
import Link from 'next/link';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signInWithEmail } from '@/app/(auth)/sign-in/components/actions';

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>;

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, { message: 'Please enter your password' })
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

const ERROR_MESSAGES = {
  invalid_token: 'Your verification link has expired or is invalid.',
  verification_required: 'Please verify your email address before signing in.',
  invalid_credentials: 'Invalid email or password. Please try again.',
  account_blocked: 'Your account has been blocked. Please contact support.',
  expired_token: 'Your verification link has expired.',
  default: 'An error occurred. Please try again.',
};

const SUCCESS_MESSAGES = {
  verification_sent:
    "We've sent you an email with a verification link. Please check your inbox.",
  password_reset:
    'Your password has been reset successfully. You can now log in with your new password.',
  default: 'Success! Please sign in.',
};

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const errorCode = searchParams?.get('error');
    if (errorCode) {
      setAuthError(
        ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] ||
          ERROR_MESSAGES.default,
      );
    }

    const success = searchParams?.get('success');
    if (success) {
      setSuccessMessage(
        SUCCESS_MESSAGES[success as keyof typeof SUCCESS_MESSAGES] ||
          SUCCESS_MESSAGES.default,
      );
    }

    const email = searchParams?.get('email');
    if (email) {
      form.setValue('email', email);
    }
  }, [searchParams, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAuthError(null);
    setSuccessMessage(null);

    try {
      const result = await signInWithEmail(values.email, values.password);

      if (result.success) {
        router.push('/');
        router.refresh();
        return;
      }

      const statusCodeMessages: Record<number, string> = {
        401: 'Invalid email or password. Please try again.',
        403: 'Please verify your email address before signing in.',
        423: 'Your account has been blocked. Please contact support.',
        429: 'Too many attempts. Please try again later.',
      };

      setAuthError(
        result.statusCode
          ? statusCodeMessages[result.statusCode] ||
              result.errorMessage ||
              'Authentication failed.'
          : result.errorMessage || 'Authentication failed.',
      );
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            {authError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert
                variant="default"
                className="bg-green-50 text-green-800 border-green-200"
              >
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-medium text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-muted-foreground hover:opacity-75"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-medium text-destructive" />
                </FormItem>
              )}
            />

            <Button className="mt-2" disabled={isLoading} type="submit">
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>

            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link
                href="/sign-up"
                className="font-medium text-primary hover:underline"
              >
                Create an account
              </Link>
            </div>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                disabled={isLoading}
              >
                <IconBrandGithub className="mr-2 h-4 w-4" /> GitHub
              </Button>
              <Button
                variant="outline"
                className="w-full"
                type="button"
                disabled={isLoading}
              >
                <IconBrandFacebook className="mr-2 h-4 w-4" /> Facebook
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
