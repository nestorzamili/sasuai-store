import { Card } from '@/components/ui/card';
import AuthLayout from '../auth-layout';
import { UserAuthForm } from './components/user-auth-form';
import { Suspense } from 'react';

export const metadata = {
  title: 'Sign In',
};

export default function SignIn() {
  return (
    <AuthLayout>
      <Card className="p-6">
        <div className="flex flex-col space-y-2 text-left">
          <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
          <p className="text-sm text-muted-foreground pb-3">
            Enter your email or username below <br />
            to log into your account
          </p>
        </div>
        <Suspense
          fallback={<p className="text-sm text-muted-foreground">Loading...</p>}
        >
          <UserAuthForm />
        </Suspense>
        <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
          By clicking login, you agree to our{' '}
          <a
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </a>
          .
        </p>
      </Card>
    </AuthLayout>
  );
}
