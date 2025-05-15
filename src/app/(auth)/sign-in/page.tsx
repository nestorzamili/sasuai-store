'use client';

import AuthLayout from '../auth-layout';
import { UserAuthForm } from './components/user-auth-form';
import { LogIn } from 'lucide-react';
import { useThemeIllustration } from '@/hooks/use-theme-illustration';
import lightIllustration from '../../../../public/images/auth-login-illustration-light.png';
import darkIllustration from '../../../../public/images/auth-login-illustration-dark.png';
import { AuthCard } from '@/components/auth/auth-card';
import { TermsFooter } from '@/components/auth/auth-footers';

export default function SignIn() {
  const illustration = useThemeIllustration(
    lightIllustration,
    darkIllustration,
  );

  return (
    <AuthLayout
      illustration={illustration}
      title="Welcome back"
      subtitle="Sign in to continue to Sasuai Store"
    >
      <AuthCard title="Sign In" icon={LogIn} footer={<TermsFooter />}>
        <UserAuthForm />
      </AuthCard>
    </AuthLayout>
  );
}
