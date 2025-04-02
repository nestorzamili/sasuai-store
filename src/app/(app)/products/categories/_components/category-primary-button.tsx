'use client';

import CategoryFormDialog from './category-form-dialog';
import { Category } from '@prisma/client';

// Define props type
interface CategoryPrimaryButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: Category & {
    _count?: {
      products: number;
    };
  };
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
