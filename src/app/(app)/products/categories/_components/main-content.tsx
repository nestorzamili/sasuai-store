'use client';

import { useState, useEffect } from 'react';
import { getAllCategoriesWithCount } from '../action';
import { CategoryWithCount } from '@/lib/types/category';
import CategoryPrimaryButton from './category-primary-button';
import { CategoryTable } from './category-table';

export default function MainContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithCount | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data, success } = await getAllCategoriesWithCount();
      if (success) {
        const categoryData = (data as CategoryWithCount[]) || [];
        setCategories(categoryData);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle dialog reset on close
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedCategory(null);
    }
  };

  // Handle edit category
  const handleEdit = (category: CategoryWithCount) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  // Handle category operation success
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedCategory(null);
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Manage Categories
          </h2>
          <p className="text-muted-foreground">
            Manage your product categories.
          </p>
        </div>
        <CategoryPrimaryButton
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          initialData={selectedCategory || undefined}
          onSuccess={handleSuccess}
        />
      </div>

      <CategoryTable
        data={categories}
        isLoading={isLoading}
        onEdit={handleEdit}
        onRefresh={fetchCategories}
      />
    </div>
  );
}
