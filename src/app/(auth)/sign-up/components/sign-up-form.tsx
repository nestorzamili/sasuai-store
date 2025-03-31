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
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    username: z
      .string()
      .trim()
      .min(5, { message: 'Username must be at least 5 characters' })
      .max(20, { message: 'Username must not exceed 20 characters' })
      .regex(/^[a-zA-Z0-9_-]+$/, {
        message:
          'Username can only contain letters, numbers, dashes, and underscores',
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
  const [authState, setAuthState] = useState<{
    message: string | null;
    isSuccess: boolean;
  }>({ message: null, isSuccess: false });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
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

  // Centralized error handling
  const handleAuthError = (error: { code?: string; message?: string }) => {
    const errorMap: { [key: string]: string } = {
      AuthUserAlreadyExists: 'This email address is already registered.',
      AuthInvalidEmail: 'Please provide a valid email address.',
      AuthWeakPassword:
        'Password is too weak. Please choose a stronger password.',
    };

    return (
      errorMap[error.code as string] ||
      error.message ||
      'Failed to sign up. Please try again.'
    );
  };

  // Sign-up submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAuthState({ message: null, isSuccess: false });

    const { name, username, email, password } = values;

    try {
      const { error } = await authClient.signUp.email({
        name,
        username,
        email,
        password,
        callbackURL: '/sign-in',
      });

      if (error) {
        setAuthState({
          message: handleAuthError(error),
          isSuccess: false,
        });
      } else {
        form.reset();
        setAuthState({
          message:
            'Registration successful! Please check your email to verify your account.',
          isSuccess: true,
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setAuthState({
        message: 'An unexpected error occurred. Please try again.',
        isSuccess: false,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            {authState.message && (
              <Alert
                variant={authState.isSuccess ? 'default' : 'destructive'}
                className={
                  authState.isSuccess
                    ? 'border-green-500 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-400'
                    : ''
                }
              >
                <div className="flex items-center gap-2">
                  {authState.isSuccess ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{authState.message}</AlertDescription>
                </div>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-medium text-destructive" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-medium text-destructive" />
                </FormItem>
              )}
            />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="********" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    At least 8 characters, including uppercase, lowercase,
                    number, and special character
                  </p>
                  <FormMessage className="text-xs font-medium text-destructive" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-medium text-destructive" />
                </FormItem>
              )}
            />
            <Button className="mt-2" disabled={isSubmitDisabled} type="submit">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
