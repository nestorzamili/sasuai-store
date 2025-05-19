'use client';

import { HTMLAttributes, useState, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
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
import { authClient } from '@/lib/auth-client';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { extractErrorMessage } from '@/lib/error-handler';
import { AuthLink } from '@/components/auth/auth-footers';

type SignUpFormProps = HTMLAttributes<HTMLDivElement>;

// Enhanced form validation schema
const formSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, { message: 'Name must be at least 3 characters' })
      .max(50, { message: 'Name must not exceed 50 characters' })
      .regex(/^[a-zA-Z\s'-]+$/, {
        message: 'Name contains invalid characters',
      }),
    email: z
      .string()
      .trim()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Invalid email address' }),
    password: z
      .string()
      .trim()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/, {
        message:
          'Password must include uppercase, lowercase, number, and special character',
      }),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  // Memoized form validation check
  const isSubmitDisabled = useMemo(() => {
    return (
      isLoading ||
      !form.formState.isValid ||
      !Object.values(form.getValues()).every(Boolean)
    );
  }, [isLoading, form.formState.isValid, form.watch()]);

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
          title: 'Registration failed',
          description: extractErrorMessage(error),
          variant: 'destructive',
        });
      } else {
        form.reset();
        toast({
          title: 'Registration successful',
          description: 'Please check your email to verify your account.',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
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
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
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
                  <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
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
                    Password
                  </FormLabel>
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-1.5 w-full">
                  <FormLabel className="text-sm sm:text-base">
                    Confirm Password
                  </FormLabel>
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
              className="mt-1 mb-2 sm:mt-2 h-9 sm:h-11 text-sm sm:text-base font-medium w-full"
              disabled={isSubmitDisabled}
              type="submit"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Form>
      <AuthLink
        question="Already have an account?"
        linkText="Sign in"
        href="/sign-in"
      />
    </div>
  );
}
