'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ProductWithRelations } from '@/lib/types/product';
import ProductPrimaryButton from './product-primary-button';
import { ProductTable } from './product-table';
import ProductFilterToolbar from './product-filter-toolbar';

export default function MainContent() {
  const t = useTranslations('product.mainContent');
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter states
  const [status, setStatus] = useState('all');
  const [categoryId, setCategoryId] = useState('all');
  const [brandId, setBrandId] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Handle dialog open state change - stabilize with useCallback
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setSelectedProduct(null);
  }, []);

  // Handle edit product - stabilize with useCallback
  const handleEdit = useCallback((product: ProductWithRelations) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  }, []);

  // Handle product operation success - stabilize with useCallback
  const handleSuccess = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  }, []);

  // Parse status filter to boolean for the API - memoize
  const getStatusBooleanFilter = useCallback((): boolean | undefined => {
    switch (status) {
      case 'active':
        return true;
      case 'inactive':
        return false;
      default:
        return undefined;
    }
  }, [status]);

  // Create filter params object - memoize
  const filterParams = useMemo(
    () => ({
      isActive: getStatusBooleanFilter(),
      categoryId: categoryId !== 'all' ? categoryId : undefined,
      brandId: brandId !== 'all' ? brandId : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    }),
    [getStatusBooleanFilter, categoryId, brandId, minPrice, maxPrice],
  );

  // Create filter toolbar element - memoize
  const filterToolbarElement = useMemo(
    () => (
      <ProductFilterToolbar
        status={status}
        setStatus={setStatus}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        brandId={brandId}
        setBrandId={setBrandId}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
      />
    ),
    [status, categoryId, brandId, minPrice, maxPrice],
  );

  return (
    <div className="space-y-6">
      {/* Header with title and add button */}
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <ProductPrimaryButton
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          initialData={selectedProduct || undefined}
          onSuccess={handleSuccess}
        />
      </div>

      {/* Product table with filters */}
      <ProductTable
        onEdit={handleEdit}
        filterParams={filterParams}
        filterToolbar={filterToolbarElement}
      />
    </div>
  );
}
