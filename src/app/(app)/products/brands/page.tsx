'use client';

import { useState, useCallback } from 'react';
import { BrandWithCount } from '@/lib/types/brand';
import BrandPrimaryButton from './_components/brand-primary-button';
import { BrandTable } from './_components/brand-table';

export default function BrandsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandWithCount | null>(
    null,
  );

  // Handle dialog reset on close - stabilize with useCallback
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedBrand(null);
    }
  }, []);

  // Handle edit brand - stabilize with useCallback
  const handleEdit = useCallback((brand: BrandWithCount) => {
    setSelectedBrand(brand);
    setIsDialogOpen(true);
  }, []);

  // Handle brand operation success - stabilize with useCallback
  const handleSuccess = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedBrand(null);
  }, []);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Brand</h2>
          <p className="text-muted-foreground">
            Manage your brands here. You can add, edit, or delete brands as
            needed.
          </p>
        </div>
        <BrandPrimaryButton
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          initialData={selectedBrand || undefined}
          onSuccess={handleSuccess}
        />
      </div>
      <BrandTable onEdit={handleEdit} onRefresh={handleSuccess} />
    </div>
  );
}
