'use client';

import CategoryFormDialog from './category-form-dialog';
import { CategoryWithCount } from '@/lib/types/category';

// Define props type
interface CategoryPrimaryButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: CategoryWithCount;
  onSuccess?: () => void;
}

export default function CategoryPrimaryButton({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: CategoryPrimaryButtonProps) {
  return (
    <div className="flex gap-2">
      <CategoryFormDialog
        open={open}
        onOpenChange={onOpenChange}
        initialData={initialData}
        onSuccess={onSuccess}
      />
    </div>
  );
}
