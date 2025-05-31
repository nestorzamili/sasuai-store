'use client';

import { Suspense } from 'react';
import AuthLayout from '../auth-layout';
import { KeyRound } from 'lucide-react';
import { useThemeIllustration } from '@/hooks/use-theme-illustration';
import { useTranslations } from 'next-intl';
import lightIllustration from '../../../../public/images/auth-reset-password-illustration-light.png';
import darkIllustration from '../../../../public/images/auth-reset-password-illustration-dark.png';
import ResetPasswordContent from './components/reset-password-content';
import { AuthCard } from '@/components/auth/auth-card';

export default function ResetPassword() {
  const t = useTranslations('auth.resetPassword');
  const illustration = useThemeIllustration(
    lightIllustration,
    darkIllustration,
  );

  return (
    <AuthLayout
      illustration={illustration}
      title={t('title')}
      tagline={t('tagline')}
    >
      <AuthCard title={t('newPassword')} icon={KeyRound}>
        <Suspense
          fallback={<p className="text-center py-4">{t('loadingForm')}</p>}
        >
          <ResetPasswordContent />
        </Suspense>
      </AuthCard>
    </AuthLayout>
  );
}
