// src/app/layout.tsx
import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/theme-context';
import NextTopLoader from 'nextjs-toploader';
import '@/index.css';

export const metadata: Metadata = {
  title: 'Sasuai Store',
  description: 'Store Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <NextTopLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
