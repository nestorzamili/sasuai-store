'use client';

import { useState, useCallback } from 'react';
import { ProductWithRelations } from '@/lib/types/product';
import ProductPrimaryButton from './product-primary-button';
import { ProductTable } from './product-table';
import { IconSearch, IconX } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function MainContent() {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Parse status filter to boolean for the API
  const getStatusBooleanFilter = (): boolean | undefined => {
    switch (statusFilter) {
      case 'active':
        return true;
      case 'inactive':
        return false;
      default:
        return undefined;
    }
  };

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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search Input */}
        <div className="relative w-full max-w-sm">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 px-2.5"
              onClick={handleClearSearch}
            >
              <IconX className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Status Filter - Simplified without counts */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product table */}
      <ProductTable
        key={`products-${refreshKey}-${statusFilter}-${searchQuery}`}
        onEdit={handleEdit}
        filterParams={{
          isActive: getStatusBooleanFilter(),
          search: searchQuery,
        }}
      />
    </div>
  );
}
