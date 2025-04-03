'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProducts } from '../action';
import { ProductListItem } from '@/lib/types/product';
import { ProductsTable } from './products-table';
import { ProductsFilters } from './products-filters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

interface MainContentProps {}

export default function MainContent({}: MainContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('query') || '',
  );

  // Get filter values from URL
  const categoryId = searchParams.get('category') || undefined;
  const brandId = searchParams.get('brand') || undefined;
  const isActive =
    searchParams.get('isActive') === 'true'
      ? true
      : searchParams.get('isActive') === 'false'
      ? false
      : undefined;
  const pageParam = searchParams.get('page');
  const queryParam = searchParams.get('query') || undefined;

  // Parse page parameter
  useEffect(() => {
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    setCurrentPage(isNaN(page) ? 1 : page);
  }, [pageParam]);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);

      try {
        const result = await getProducts({
          query: queryParam,
          categoryId,
          brandId,
          isActive,
          page: currentPage,
          limit: 10,
        });

        if (result.success && result.data) {
          setProducts(result.data.products);
          setTotalCount(result.data.totalCount);
          setTotalPages(result.data.totalPages);

          // Reset to page 1 if current page is beyond total pages
          if (
            currentPage > result.data.totalPages &&
            result.data.totalPages > 0
          ) {
            handlePageChange(1);
          }
        } else {
          setProducts([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [queryParam, categoryId, brandId, isActive, currentPage]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);

    if (searchQuery) {
      params.set('query', searchQuery);
    } else {
      params.delete('query');
    }

    // Reset to page 1 when searching
    params.delete('page');

    router.push(`/products?${params.toString()}`);
  };

  // Handle filter changes
  const handleFilterChange = (filter: {
    key: string;
    value: string | null;
  }) => {
    const params = new URLSearchParams(searchParams);

    if (filter.value === null) {
      params.delete(filter.key);
    } else {
      params.set(filter.key, filter.value);
    }

    // Reset to page 1 when filters change
    params.delete('page');

    router.push(`/products?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);

    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }

    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product catalog with variants and pricing
          </p>
        </div>
        <Link href="/products/new" passHref>
          <Button className="flex items-center gap-1">
            <IconPlus size={18} /> Add Product
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {/* Search input */}
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-sm items-center space-x-2"
        >
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </form>

        <ProductsFilters
          selectedCategory={categoryId}
          selectedBrand={brandId}
          isActive={isActive}
          onFilterChange={handleFilterChange}
        />
      </div>

      <ProductsTable
        products={products}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalCount={totalCount}
      />
    </div>
  );
}
