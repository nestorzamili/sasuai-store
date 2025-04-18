'use client';
import { HTMLAttributes, useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  signInWithEmail,
  signInWithUsername,
} from '@/app/(auth)/sign-in/components/actions';

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>;

const formSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: 'Please enter your email or username' }),
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
      identifier: '',
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
      form.setValue('identifier', email);
    }
  }, [searchParams, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAuthError(null);
    setSuccessMessage(null);

    try {
      // Check if identifier is email (contains @) or username
      const trimmedIdentifier = values.identifier.trim();
      const isEmail = trimmedIdentifier.includes('@');

      let result;
      if (isEmail) {
        result = await signInWithEmail(values.identifier, values.password);
      } else {
        result = await signInWithUsername(values.identifier, values.password);
      }

      if (result.success) {
        router.push('/');
        router.refresh();
        return;
      }

      const statusCodeMessages: Record<number, string> = {
        401: 'Invalid credentials. Please try again.',
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
              name="identifier"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Email or Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com or username"
                      {...field}
                    />
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
          </div>
        </form>
      </Form>
    </div>
  );
}
