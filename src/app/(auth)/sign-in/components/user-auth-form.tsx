'use client';

import { HTMLAttributes, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
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
import { useToast } from '@/hooks/use-toast';
import { signInWithEmail, signInWithUsername } from './actions';
import { AuthLink } from '@/components/auth/auth-footers';

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>;

// A combined schema that accepts either email or username
const formSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: 'Please enter your email or username' })
    .refine(
      (value) => {
        // Either valid email or username with minimum length
        const isEmail = value.includes('@') && value.includes('.');
        const isUsername = !value.includes('@') && value.length >= 3;
        return isEmail || isUsername;
      },
      {
        message: 'Please enter a valid email or username (min 3 characters)',
      },
    ),
  password: z
    .string()
    .min(1, { message: 'Please enter your password' })
    .min(7, { message: 'Password must be at least 7 characters long' }),
});

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { identifier: '', password: '' },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Determine login method based on identifier format
      const isEmail = data.identifier.includes('@');
      let result;

      if (isEmail) {
        result = await signInWithEmail(data.identifier, data.password);
      } else {
        result = await signInWithUsername(data.identifier, data.password);
      }

      if (result.success) {
        // Show success toast first
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });

        // Force a more comprehensive redirect strategy
        try {
          // First, try to refresh the page to update session
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Use window.location for more reliable navigation
          window.location.href = '/';

          // Fallback: use Next.js router after a delay
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 1000);
        } catch (navigationError) {
          console.error('Navigation error:', navigationError);
          // Ultimate fallback
          window.location.replace('/');
        }

        return;
      }

      // Reset password field but keep identifier
      form.setValue('password', '');

      // Use a user-friendly error message
      const errorMessage = result.errorMessage
        ? typeof result.errorMessage === 'string'
          ? result.errorMessage
          : 'Invalid credentials'
        : 'Authentication failed. Please try again.';

      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Login error:', error);
      form.setValue('password', '');

      toast({
        title: 'Error',
        description: 'Authentication failed. Please try again.',
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
              name="identifier"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-1.5 w-full">
                  <FormLabel className="text-sm sm:text-base">
                    Email or Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com or username"
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
                  <div className="flex items-center justify-between w-full">
                    <FormLabel className="text-sm sm:text-base">
                      Password
                    </FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs sm:text-sm font-medium text-primary hover:opacity-80 transition-opacity"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder="********"
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
              className="mt-1 sm:mt-2 h-9 sm:h-11 text-sm sm:text-base font-medium w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Sign in'}
            </Button>

            <AuthLink
              question="Don't have an account?"
              linkText="Create an account"
              href="/sign-up"
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
