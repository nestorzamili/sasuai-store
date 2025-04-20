'use client';

import Cookies from 'js-cookie';
import { SearchProvider } from '@/context/search-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { cn } from '@/lib/utils';
import { StrictMode } from 'react';
import { AuthProvider } from '@/context/auth-context';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Toaster } from '@/components/ui/toaster';
import { BreadCrumb } from '@/components/breadcrumb';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const defaultOpen = Cookies.get('sidebar:state') !== 'false';

  return (
    <div className="group/body">
      <StrictMode>
        <AuthProvider>
          <SearchProvider>
            <SidebarProvider defaultOpen={defaultOpen}>
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
                  'group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh'
                )}
              >
                <Header fixed>
                  <Search placeholder="Search..." />
                  <div className="ml-auto flex items-center space-x-4">
                    <ThemeSwitch />
                    <ProfileDropdown />
                  </div>
                </Header>
                <Main>
                  <BreadCrumb />
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
