'use client';

import AuthLayout from '../auth-layout';
import { SignUpForm } from './components/sign-up-form';
import { UserPlus } from 'lucide-react';
import { useThemeIllustration } from '@/hooks/use-theme-illustration';
import lightIllustration from '../../../../public/images/auth-register-illustration-light.png';
import darkIllustration from '../../../../public/images/auth-register-illustration-dark.png';
import { AuthCard } from '@/components/auth/auth-card';
import { TermsFooter } from '@/components/auth/auth-footers';

export default function SignUp() {
  const illustration = useThemeIllustration(
    lightIllustration,
    darkIllustration,
  );

  return (
    <AuthLayout
      illustration={illustration}
      title="Join Sasuai Store"
      subtitle="Create your account to get started"
      tagline="Your journey starts here with us"
    >
      <AuthCard title="Create Account" icon={UserPlus} footer={<TermsFooter />}>
        <SignUpForm />
      </AuthCard>
    </AuthLayout>
  );
}
