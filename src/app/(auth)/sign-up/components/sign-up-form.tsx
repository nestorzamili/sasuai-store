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
import { authClient } from '@/lib/auth-client';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type SignUpFormProps = HTMLAttributes<HTMLDivElement>;

const formSchema = z
  .object({
    name: z.string().min(3, { message: 'Please enter your name' }),
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
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAuthMessage(null);
    setIsSuccess(false);

    const { name, email, password } = values;

    try {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: '/sign-in',
      });

      if (error) {
        // Handle different error codes
        let errorMessage = 'Failed to sign up. Please try again.';

        switch (error.code) {
          case 'AuthUserAlreadyExists':
            errorMessage = 'This email address is already registered.';
            break;
          case 'AuthInvalidEmail':
            errorMessage = 'Please provide a valid email address.';
            break;
          case 'AuthWeakPassword':
            errorMessage =
              'Password is too weak. Please choose a stronger password.';
            break;
          default:
            if (error.message) {
              errorMessage = error.message;
            }
        }

        setAuthMessage(errorMessage);
        setIsSuccess(false);
      } else {
        // Registration successful
        form.reset();
        setIsSuccess(true);
        setAuthMessage(
          'Registration successful! Please check your email to verify your account.',
        );
      }
    } catch (err) {
      console.error('Registration error:', err);
      setAuthMessage('An unexpected error occurred. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            {authMessage && (
              <Alert
                variant={isSuccess ? 'default' : 'destructive'}
                className={
                  isSuccess
                    ? 'border-green-500 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-400'
                    : ''
                }
              >
                <div className="flex items-center gap-2">
                  {isSuccess ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{authMessage}</AlertDescription>
                </div>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
            <Button className="mt-2" disabled={isLoading} type="submit">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

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
