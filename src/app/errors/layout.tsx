import { ThemeProvider } from '@/context/theme-context';
import '@/index.css';
import { StrictMode } from 'react';

export default function AuthRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="group/body">
        <StrictMode>
          <ThemeProvider defaultTheme="light" storageKey="ui-theme">
            {children}
          </ThemeProvider>
        </StrictMode>
      </body>
    </html>
  );
}
