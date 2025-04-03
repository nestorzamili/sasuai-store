'use client';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import MainContent from './_components/main-content';
import { ErrorBoundary } from '@/components/error-boundary';

export default function ProductsPage() {
  return (
    <>
      <Header fixed>
        <Search placeholder="Search..." />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <ErrorBoundary
          fallback={
            <p>
              Something went wrong with the products page. Please try again
              later.
            </p>
          }
        >
          <MainContent />
        </ErrorBoundary>
      </Main>
    </>
  );
}
