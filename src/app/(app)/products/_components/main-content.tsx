'use client';

import { useState, useCallback } from 'react';
import { ProductWithRelations } from '@/lib/types/product';
import ProductPrimaryButton from './product-primary-button';
import { ProductTable } from './product-table';
import ProductFilterToolbar from './product-filter-toolbar';

export default function MainContent() {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // Filter states
  const [status, setStatus] = useState('all');
  const [categoryId, setCategoryId] = useState('all');
  const [brandId, setBrandId] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Handle dialog open state change
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setSelectedProduct(null);
  }, []);

  // Handle edit product
  const handleEdit = useCallback((product: ProductWithRelations) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  }, []);

  // Handle product operation success
  const handleSuccess = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
    setRefreshKey(Date.now());
  }, []);

  // Parse status filter to boolean for the API
  const getStatusBooleanFilter = (): boolean | undefined => {
    switch (status) {
      case 'active':
        return true;
      case 'inactive':
        return false;
      default:
        return undefined;
    }
  };

  // Create filter params object
  const filterParams = {
    isActive: getStatusBooleanFilter(),
    categoryId: categoryId !== 'all' ? categoryId : undefined,
    brandId: brandId !== 'all' ? brandId : undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
  };

  // Create filter toolbar element
  const filterToolbarElement = (
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
  );

  return (
    <div className="space-y-6">
      {/* Header with title and add button */}
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Products</h2>
          <p className="text-muted-foreground">
            View and manage your product inventory
          </p>
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
        key={`products-${refreshKey}-${status}-${categoryId}-${brandId}-${minPrice}-${maxPrice}`}
        onEdit={handleEdit}
        filterParams={filterParams}
        filterToolbar={filterToolbarElement}
      />
    </div>
  );
}
