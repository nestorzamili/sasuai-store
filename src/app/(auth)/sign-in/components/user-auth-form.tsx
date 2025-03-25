'use client';

import { HTMLAttributes, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
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
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
    .min(1, {
      message: 'Please enter your password',
    })
    .min(8, {
      message: 'Password must be at least 8 characters long',
    }),
});

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAuthError(null); // Reset error message

    try {
      const result = await signInWithEmail(values.email, values.password);

      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        let errorMessage = 'Invalid email or password';

        // Handle specific error codes
        if (result.error === 'AuthMissingEmailVerification') {
          errorMessage = 'Please verify your email before logging in';
        } else if (result.error === 'AuthInvalidCredentials') {
          errorMessage = 'Invalid email or password';
        } else if (result.error === 'AuthUserBlocked') {
          errorMessage =
            'Your account has been blocked. Please contact support.';
        } else if (result.errorMessage) {
          errorMessage = result.errorMessage;
        }

        setAuthError(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
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

            {/* Link untuk pendaftaran */}
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
