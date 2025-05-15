import Link from 'next/link';

export function TermsFooter() {
  return (
    <div className="pt-2 text-center text-xs sm:text-sm text-muted-foreground">
      <p className="leading-relaxed">
        By signing in, you agree to our{' '}
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
        Back to Login
      </Link>
    </div>
  );
}
