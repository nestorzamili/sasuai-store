'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { getAllBrands } from '../brands/action';
import { getAllCategories } from '../categories/action';
import { ComboBox, ComboBoxOption } from '@/components/ui/combobox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';

interface ProductsFiltersProps {
  selectedCategory?: string;
  selectedBrand?: string;
  isActive?: boolean;
  onFilterChange: (filter: { key: string; value: string | null }) => void;
}

export function ProductsFilters({
  selectedCategory,
  selectedBrand,
  isActive,
  onFilterChange,
}: ProductsFiltersProps) {
  const [categories, setCategories] = useState<ComboBoxOption[]>([]);
  const [brands, setBrands] = useState<ComboBoxOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);

  // Load categories
  useEffect(() => {
    async function fetchCategories() {
      setLoadingCategories(true);
      try {
        const response = await getAllCategories();
        if (response.success && response.data) {
          const options = response.data.map((category) => ({
            value: category.id,
            label: category.name,
          }));
          setCategories(options);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []);

  // Load brands
  useEffect(() => {
    async function fetchBrands() {
      setLoadingBrands(true);
      try {
        const response = await getAllBrands();
        if (response.success && response.data) {
          const options = response.data.map((brand) => ({
            value: brand.id,
            label: brand.name,
          }));
          setBrands(options);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoadingBrands(false);
      }
    }

    fetchBrands();
  }, []);

  // Handle category change
  const handleCategoryChange = (value: string) => {
    onFilterChange({ key: 'category', value: value || null });
  };

  // Handle brand change
  const handleBrandChange = (value: string) => {
    onFilterChange({ key: 'brand', value: value || null });
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    onFilterChange({ key: 'isActive', value: value });
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedBrand) count++;
    if (isActive !== undefined) count++;
    return count;
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFilterChange({ key: 'category', value: null });
    onFilterChange({ key: 'brand', value: null });
    onFilterChange({ key: 'isActive', value: null });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <div className="w-64">
          <Label htmlFor="category-filter" className="mb-2 block">
            Category
          </Label>
          <ComboBox
            options={categories}
            value={selectedCategory || ''}
            onChange={handleCategoryChange}
            placeholder="All Categories"
            disabled={loadingCategories}
            emptyMessage="No categories found"
          />
        </div>

        <div className="w-64">
          <Label htmlFor="brand-filter" className="mb-2 block">
            Brand
          </Label>
          <ComboBox
            options={brands}
            value={selectedBrand || ''}
            onChange={handleBrandChange}
            placeholder="All Brands"
            disabled={loadingBrands}
            emptyMessage="No brands found"
          />
        </div>

        <div>
          <Label className="mb-2 block">Status</Label>
          <ToggleGroup
            type="single"
            value={isActive?.toString() || ''}
            onValueChange={handleStatusChange}
          >
            <ToggleGroupItem value="" aria-label="All">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="true" aria-label="Active">
              Active
            </ToggleGroupItem>
            <ToggleGroupItem value="false" aria-label="Inactive">
              Inactive
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {getActiveFiltersCount() > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {selectedCategory && (
            <Badge variant="outline" className="px-2 py-1">
              {categories.find((c) => c.value === selectedCategory)?.label ||
                'Category'}
              <button
                className="ml-1 rounded-full hover:bg-accent p-1"
                onClick={() => onFilterChange({ key: 'category', value: null })}
                aria-label="Remove category filter"
              >
                ✕
              </button>
            </Badge>
          )}

          {selectedBrand && (
            <Badge variant="outline" className="px-2 py-1">
              {brands.find((b) => b.value === selectedBrand)?.label || 'Brand'}
              <button
                className="ml-1 rounded-full hover:bg-accent p-1"
                onClick={() => onFilterChange({ key: 'brand', value: null })}
                aria-label="Remove brand filter"
              >
                ✕
              </button>
            </Badge>
          )}

          {isActive !== undefined && (
            <Badge variant="outline" className="px-2 py-1">
              {isActive ? 'Active' : 'Inactive'}
              <button
                className="ml-1 rounded-full hover:bg-accent p-1"
                onClick={() => onFilterChange({ key: 'isActive', value: null })}
                aria-label="Remove status filter"
              >
                ✕
              </button>
            </Badge>
          )}

          <button
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={clearAllFilters}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
