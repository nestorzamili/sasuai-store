'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import ProductForm from '../../_components/product-form';
import { LoadingSpinner } from '@/components/loading-spinner';
import { getProduct } from '../../action';
import { ErrorBoundary } from '@/components/error-boundary';

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [productData, setProductData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const result = await getProduct(productId);
        if (result.success && result.data) {
          setProductData(result.data);
        } else {
          setError(result.error || 'Failed to fetch product');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

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
          {isLoading ? (
            <div className="flex justify-center items-center h-[50vh]">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center text-destructive">
              <p>{error}</p>
            </div>
          ) : (
            <ProductForm initialData={productData} isEdit />
          )}
        </ErrorBoundary>
      </Main>
    </>
  );
}
