'use client';

import AuthLayout from '../auth-layout';
import { SignUpForm } from './components/sign-up-form';
import { UserPlus } from 'lucide-react';
import { useThemeIllustration } from '@/hooks/use-theme-illustration';
import { useTranslations } from 'next-intl';
import lightIllustration from '../../../../public/images/auth-register-illustration-light.png';
import darkIllustration from '../../../../public/images/auth-register-illustration-dark.png';
import { AuthCard } from '@/components/auth/auth-card';
import { TermsFooter } from '@/components/auth/auth-footers';

export default function SignUp() {
  const t = useTranslations('auth.signUp');
  const illustration = useThemeIllustration(
    lightIllustration,
    darkIllustration,
  );

  return (
    <AuthLayout
      illustration={illustration}
      title={t('title')}
      subtitle={t('subtitle')}
      tagline={t('tagline')}
    >
      <AuthCard
        title={t('createAccount')}
        icon={UserPlus}
        footer={<TermsFooter />}
      >
        <SignUpForm />
      </AuthCard>
    </AuthLayout>
  );
}
