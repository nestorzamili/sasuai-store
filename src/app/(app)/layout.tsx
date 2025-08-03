'use client';

import { SearchProvider } from '@/context/search-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { cn } from '@/lib/utils';
import { StrictMode, useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Toaster } from '@/components/ui/toaster';
import { BreadCrumb } from '@/components/breadcrumb';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useClientHydration } from '@/hooks/use-client-hydration';
import { getSidebarStateFromCookie } from '@/utils/sidebar-utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  BreadcrumbContext,
  BreadcrumbLabels,
} from '@/context/breadcrumb-context';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error } = useAuth();
  const isClient = useClientHydration();

  if (!isClient || isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !user) {
    return <LoadingSpinner message="Redirecting..." />;
  }

  return <>{children}</>;
}

// Main layout content component
function LayoutContent({ children }: { children: React.ReactNode }) {
  const isClient = useClientHydration();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Create state to hold custom breadcrumb labels
  const [breadcrumbLabels, setBreadcrumbLabels] = useState<BreadcrumbLabels>(
    {},
  );

  // Hydrate sidebar state on client side
  useEffect(() => {
    if (isClient) {
      const savedState = getSidebarStateFromCookie();
      setSidebarOpen(savedState);
    }
  }, [isClient]);

  // Memoized function to expose to child components to update breadcrumb labels
  const updateBreadcrumb = useCallback((id: string, label: string) => {
    setBreadcrumbLabels((prev) => ({
      ...prev,
      [id]: label,
    }));
  }, []);

  return (
    <div className="group/body">
      <StrictMode>
        <SearchProvider>
          <BreadcrumbContext.Provider
            value={{ breadcrumbLabels, updateBreadcrumb }}
          >
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
          </BreadcrumbContext.Provider>
        </SearchProvider>
      </StrictMode>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <LayoutContent>{children}</LayoutContent>
      </AuthGuard>
    </AuthProvider>
  );
}
