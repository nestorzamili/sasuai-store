'use client';

import { HTMLAttributes, useState } from 'react';
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
import { authClient } from '@/lib/auth-client';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ForgotFormProps = HTMLAttributes<HTMLDivElement>;

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
});

export function ForgotForm({ className, ...props }: ForgotFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setFormState({ status: 'idle', message: '' });

    try {
      const response = await authClient.forgetPassword({
        email: data.email,
        redirectTo: '/reset-password',
      });

      if (response.error) {
        // Get a safe error message
        const errorMessage =
          typeof response.error.message === 'string'
            ? response.error.message
            : 'Failed to process your request';

        setFormState({
          status: 'error',
          message: errorMessage,
        });
        return;
      }

      // Success path
      setFormState({
        status: 'success',
        message:
          'If the email exists in our database, an email will be sent to your inbox to reset your password.',
      });

      // Clear the form on success
      form.reset();
    } catch (error) {
      console.error('Error during password reset:', error);
      setFormState({
        status: 'error',
        message: 'Unable to process your request. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn('w-full', className)} {...props}>
      {formState.status !== 'idle' && (
        <Alert
          variant={formState.status === 'success' ? 'default' : 'destructive'}
          className={
            formState.status === 'success'
              ? 'border-green-500 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-400 mb-4'
              : 'mb-4'
          }
        >
          <div className="flex items-center gap-2">
            {formState.status === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{formState.message}</AlertDescription>
          </div>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="grid gap-3 sm:gap-4 w-full">
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
            <Button
              className="mt-1 sm:mt-2 h-9 sm:h-10 text-sm sm:text-base font-medium w-full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Continue'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
