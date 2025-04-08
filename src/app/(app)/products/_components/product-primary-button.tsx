'use client';

import ProductFormDialog from './product-form';
import { ProductWithRelations } from '@/lib/types/product';

// Define props type
interface ProductPrimaryButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: ProductWithRelations;
  onSuccess?: () => void;
}

export default function ProductPrimaryButton({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: ProductPrimaryButtonProps) {
  return (
    <div className="flex gap-2">
      <ProductFormDialog
        open={open}
        onOpenChange={onOpenChange}
        initialData={initialData}
        onSuccess={onSuccess}
      />
    </div>
  );
}
