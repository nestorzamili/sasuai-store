'use client';

import { SearchProvider } from '@/context/search-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { cn } from '@/lib/utils';
import { StrictMode, useState, useEffect } from 'react';
import { AuthProvider } from '@/context/auth-context';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Toaster } from '@/components/ui/toaster';
import { BreadCrumb } from '@/components/breadcrumb';
import { LanguageSwitcher } from '@/components/language-switcher';

// Create a type-safe context for breadcrumb labels
export type BreadcrumbLabels = Record<string, string>;

// Deklarasi type untuk global window object
declare global {
  interface Window {
    __updateBreadcrumb: (id: string, label: string) => void;
  }
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to true for SSR

  // Create state to hold custom breadcrumb labels
  const [breadcrumbLabels, setBreadcrumbLabels] = useState<BreadcrumbLabels>(
    {},
  );

  // Hydrate sidebar state on client side
  useEffect(() => {
    setIsClient(true);
    // Only read from cookies after hydration
    const savedState = document.cookie
      .split('; ')
      .find((row) => row.startsWith('sidebar:state='))
      ?.split('=')[1];

    setSidebarOpen(savedState !== 'false');
  }, []);

  // Function to expose to child components to update breadcrumb labels
  const updateBreadcrumb = (id: string, label: string) => {
    setBreadcrumbLabels((prev) => ({
      ...prev,
      [id]: label,
    }));
  };

  // Add updateBreadcrumb to the window object so it can be accessed from any component
  useEffect(() => {
    if (isClient) {
      window.__updateBreadcrumb = updateBreadcrumb;
    }
  }, [isClient]);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="group/body">
        <StrictMode>
          <AuthProvider>
            <SearchProvider>
              <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <div
                  id="content"
                  className={cn(
                    'max-w-full w-full ml-auto',
                    'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
                    'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
                    'transition-[width] ease-linear duration-200',
                    'h-svh flex flex-col',
                    'group-data-[scroll-locked=1]/body:h-full',
                    'group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh',
                  )}
                >
                  <Header fixed>
                    <Search />
                    <div className="ml-auto flex items-center gap-2">
                      <LanguageSwitcher />
                      <ThemeSwitch />
                      <ProfileDropdown />
                    </div>
                  </Header>
                  <Main>
                    <BreadCrumb customLabels={breadcrumbLabels} />
                    {children}
                  </Main>
                  <Toaster />
                </div>
              </SidebarProvider>
            </SearchProvider>
          </AuthProvider>
        </StrictMode>
      </div>
    );
  }

  return (
    <div className="group/body">
      <StrictMode>
        <AuthProvider>
          <SearchProvider>
            <SidebarProvider defaultOpen={sidebarOpen}>
              <AppSidebar />
              <div
                id="content"
                className={cn(
                  'max-w-full w-full ml-auto',
                  'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
                  'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
                  'transition-[width] ease-linear duration-200',
                  'h-svh flex flex-col',
                  'group-data-[scroll-locked=1]/body:h-full',
                  'group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh',
                )}
              >
                <Header fixed>
                  <Search />
                  <div className="ml-auto flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeSwitch />
                    <ProfileDropdown />
                  </div>
                </Header>
                <Main>
                  <BreadCrumb customLabels={breadcrumbLabels} />
                  {children}
                </Main>
                <Toaster />
              </div>
            </SidebarProvider>
          </SearchProvider>
        </AuthProvider>
      </StrictMode>
    </div>
  );
}
