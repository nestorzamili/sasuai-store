'use client';

import { useState } from 'react';
import { CategoryWithCount } from '@/lib/types/category';
import CategoryPrimaryButton from './_components/category-primary-button';
import { CategoryTable } from './_components/category-table';

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithCount | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Category</h2>
          <p className="text-muted-foreground">
            Manage your categories here. You can add, edit, or delete categories
            as needed.
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
        onEdit={handleEdit}
        onRefresh={handleSuccess}
        key={`category-table-${refreshTrigger}`}
      />
    </div>
  );
}
