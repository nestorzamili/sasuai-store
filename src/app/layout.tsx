// src/app/layout.tsx
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/context/theme-context';
import NextTopLoader from 'nextjs-toploader';
import '@/index.css';

export const metadata: Metadata = {
  title: 'Sasuai Store',
  description: 'Store Management System',
};

// Initialize scheduler on server-side only
if (typeof window === 'undefined') {
  import('@/lib/services/scheduler.service').then(({ SchedulerService }) => {
    SchedulerService.initialize().catch(console.error);
  });
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider defaultTheme="light" storageKey="ui-theme">
            <NextTopLoader showSpinner={false} />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
