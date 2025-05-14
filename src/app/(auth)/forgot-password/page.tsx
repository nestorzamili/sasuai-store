'use client';

import AuthLayout from '../auth-layout';
import { ForgotForm } from './components/forgot-password-form';
import { AlertCircle } from 'lucide-react';
import { useThemeIllustration } from '@/hooks/use-theme-illustration';
import lightIllustration from '../../../../public/images/auth-forgot-password-illustration-light.png';
import darkIllustration from '../../../../public/images/auth-forgot-password-illustration-dark.png';
import { AuthCard } from '@/components/auth/auth-card';
import { BackToLoginLink } from '@/components/auth/auth-footers';

export default function ForgotPassword() {
  const illustration = useThemeIllustration(
    lightIllustration,
    darkIllustration,
  );

  return (
    <AuthLayout
      illustration={illustration}
      title="Password Recovery"
      tagline="We'll help you recover your account"
    >
      <AuthCard
        title="Forgot Password"
        icon={AlertCircle}
        footer={<BackToLoginLink />}
      >
        <div className="mb-4 sm:mb-5">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Enter your registered email address and we&apos;ll send you a link
            to reset your password.
          </p>
        </div>

        <ForgotForm />
      </AuthCard>
    </AuthLayout>
  );
}
