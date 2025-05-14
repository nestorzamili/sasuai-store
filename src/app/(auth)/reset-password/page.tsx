'use client';

import { Suspense } from 'react';
import AuthLayout from '../auth-layout';
import { KeyRound } from 'lucide-react';
import { useThemeIllustration } from '@/hooks/use-theme-illustration';
import lightIllustration from '../../../../public/images/auth-reset-password-illustration-light.png';
import darkIllustration from '../../../../public/images/auth-reset-password-illustration-dark.png';
import ResetPasswordContent from './components/reset-password-content';
import { AuthCard } from '@/components/auth/auth-card';

export default function ResetPassword() {
  const illustration = useThemeIllustration(
    lightIllustration,
    darkIllustration,
  );

  return (
    <AuthLayout
      illustration={illustration}
      title="Reset Password"
      tagline="Set up a new secure password for your account"
    >
      <AuthCard title="New Password" icon={KeyRound}>
        <Suspense
          fallback={
            <p className="text-center py-4">Loading reset password form...</p>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </AuthCard>
    </AuthLayout>
  );
}
