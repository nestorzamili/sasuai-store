import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function TermsFooter() {
  const t = useTranslations('auth');

  return (
    <div className="pt-2 text-center text-xs sm:text-sm text-muted-foreground">
      <p className="leading-relaxed">
        {t('termsAgreement')}{' '}
        <a
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          {t('termsOfService')}
        </a>{' '}
        {t('and')}{' '}
        <a
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          {t('privacyPolicy')}
        </a>
      </p>
    </div>
  );
}

interface AuthLinkProps {
  question: string;
  linkText: string;
  href: string;
}

export function AuthLink({ question, linkText, href }: AuthLinkProps) {
  return (
    <div className="text-center text-xs sm:text-sm w-full">
      {question}{' '}
      <Link href={href} className="font-medium text-primary hover:underline">
        {linkText}
      </Link>
    </div>
  );
}

export function BackToLoginLink() {
  const t = useTranslations('auth');

  return (
    <div className="text-center">
      <Link
        href="/sign-in"
        className="inline-flex items-center text-primary text-sm font-medium hover:underline transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1.5"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        {t('backToLogin')}
      </Link>
    </div>
  );
}
