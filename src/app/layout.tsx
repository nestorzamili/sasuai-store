// src/app/layout.tsx
import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/theme-context';
import '@/index.css';

export const metadata: Metadata = {
  title: 'Samunu',
  description: 'Project Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <body>{children}</body>
      </ThemeProvider>
    </html>
  );
}
