'use client';

import { Card } from '@/components/ui/card';
import AuthLayout from '../auth-layout';
import { ForgotForm } from './components/forgot-password-form';
import Link from 'next/link';

export default function ForgotPassword() {
  return (
    <AuthLayout>
      <Card className="p-6">
        <div className="mb-4 flex flex-col space-y-2 text-left">
          <h1 className="text-xl font-semibold tracking-tight">
            Forgot Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your registered email and we will send you a link to reset
            your password.
          </p>
        </div>
        <ForgotForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link
            href="/sign-in"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
