// src/app/(auth)/layout.tsx
import { ThemeProvider } from '@/context/theme-context';

export const metadata = {
  title: {
    template: '%s | Sasuai Auth',
    default: 'Authentication - Sasuai Store',
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <main className="flex min-h-screen items-center justify-center">
        {children}
      </main>
    </ThemeProvider>
  );
}
