'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { CategoryWithCount } from '@/lib/types/category';
import CategoryPrimaryButton from './_components/category-primary-button';
import { CategoryTable } from './_components/category-table';

export default function CategoriesPage() {
  const t = useTranslations('category');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithCount | null>(null);

  // Handle dialog reset on close - stabilize with useCallback
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedCategory(null);
    }
  }, []);

  // Handle edit category - stabilize with useCallback
  const handleEdit = useCallback((category: CategoryWithCount) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  }, []);

  // Handle category operation success - stabilize with useCallback
  const handleSuccess = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedCategory(null);
  }, []);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <CategoryPrimaryButton
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          initialData={selectedCategory || undefined}
          onSuccess={handleSuccess}
        />
      </div>
      <CategoryTable onEdit={handleEdit} onRefresh={handleSuccess} />
    </div>
  );
}
