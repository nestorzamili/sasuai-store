'use client';

import { ResetForm } from './reset-password-form';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function ResetPasswordContent() {
  // useSearchParams is now safely wrapped in a Suspense boundary in the parent component
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const validateToken = async () => {
      // Small delay to prevent UI flash
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!token) {
        toast({
          title: 'Invalid token',
          description: 'Invalid or missing reset token.',
          variant: 'destructive',
        });
        setIsValidating(false);
        return;
      }

      try {
        // Simple token validation (in a real app, you'd verify this with your backend)
        setTokenValid(token.length > 0);

        if (token.length === 0) {
          toast({
            title: 'Invalid token',
            description: 'Your password reset link is invalid or has expired.',
            variant: 'destructive',
          });
        }
      } catch (err) {
        toast({
          title: 'Error',
          description: 'An error occurred while validating your reset link.',
          variant: 'destructive',
        });
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, toast]);

  if (isValidating) {
    return (
      <div className="w-full text-center py-4">
        <p className="text-sm text-muted-foreground">
          Verifying your reset link...
        </p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center space-x-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            Your password reset link is invalid or has expired.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 pt-2">
          <p className="text-sm text-center text-muted-foreground">
            Need a new password reset link?
          </p>
          <Link href="/forgot-password" className="w-full">
            <Button variant="outline" className="w-full">
              Request New Link
            </Button>
          </Link>
        </div>

        <div className="text-center text-sm pt-2">
          <p className="text-muted-foreground">
            Remember your password?{' '}
            <Link
              href="/sign-in"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-sm text-muted-foreground mb-4">
        Create a new password for your account
      </p>
      {token && <ResetForm token={token} />}

      <div className="text-center text-sm mt-6">
        <p className="text-muted-foreground">
          Remember your password?{' '}
          <Link
            href="/sign-in"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
