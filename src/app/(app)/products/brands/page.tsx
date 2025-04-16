'use client';

import { useState } from 'react';
import { BrandWithCount } from '@/lib/types/brand';
import BrandPrimaryButton from './_components/brand-primary-button';
import { BrandTable } from './_components/brand-table';

export default function BrandsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandWithCount | null>(
    null,
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle dialog reset on close
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedBrand(null);
    }
  };

  // Handle edit brand
  const handleEdit = (brand: BrandWithCount) => {
    setSelectedBrand(brand);
    setIsDialogOpen(true);
  };

  // Handle brand operation success
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedBrand(null);
    setRefreshTrigger((prev) => prev + 1);
  };

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
      <BrandTable
        onEdit={handleEdit}
        onRefresh={handleSuccess}
        key={`brand-table-${refreshTrigger}`}
      />
    </div>
  );
}
