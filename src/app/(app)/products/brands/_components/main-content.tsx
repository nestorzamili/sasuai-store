'use client';

import { useState, useEffect } from 'react';
import { getAllBrandsWithCount } from '../action';
import { BrandWithCount } from '@/lib/types/brand';
import BrandPrimaryButton from './brand-primary-button';
import { BrandTable } from './brand-table';
import { toast } from '@/hooks/use-toast';

export default function MainContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [brands, setBrands] = useState<BrandWithCount[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<BrandWithCount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandWithCount | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const { data, success } = await getAllBrandsWithCount();
      if (success) {
        // Cast the data to the correct type
        const brandData = (data as BrandWithCount[]) || [];
        setBrands(brandData);
        setFilteredBrands(brandData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch brands',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    // Filter and sort brands when searchTerm or sortOrder changes
    let filtered = [...brands];

    if (searchTerm) {
      filtered = filtered.filter((brand) =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    setFilteredBrands(filtered);
  }, [brands, searchTerm, sortOrder]);

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
    fetchBrands();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Brands</h2>
          <p className="text-muted-foreground">Manage your product brands.</p>
        </div>
        <BrandPrimaryButton
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          initialData={selectedBrand || undefined}
          onSuccess={handleSuccess}
        />
      </div>

      <BrandTable
        data={filteredBrands}
        isLoading={isLoading}
        onEdit={handleEdit}
        onRefresh={fetchBrands}
      />
    </div>
  );
}
