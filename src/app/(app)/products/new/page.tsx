'use client';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import ProductForm from '../_components/product-form';
import { ErrorBoundary } from '@/components/error-boundary';

export default function NewProductPage() {
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
          fallback={<p>Something went wrong. Please try again.</p>}
        >
          <ProductForm />
        </ErrorBoundary>
      </Main>
    </>
  );
}
