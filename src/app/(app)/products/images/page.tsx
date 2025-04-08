'use client';

import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import ProductImagesContent from './_components/product-images-content';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toaster';

function ProductImagesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-80 mb-2" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-60" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ImagesPage() {
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
        <Suspense fallback={<ProductImagesLoading />}>
          <ProductImagesContent />
        </Suspense>
      </Main>
      <Toaster />
    </>
  );
}
