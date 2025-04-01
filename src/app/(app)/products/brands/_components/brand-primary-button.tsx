'use client';

import BrandFormDialog from './brand-form-dialog';
import { Brand } from '@prisma/client';

// Define props type
interface BrandPrimaryButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: Brand & {
    _count?: {
      products: number;
    };
  };
  onSuccess?: () => void;
}

export default function BrandPrimaryButton({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: BrandPrimaryButtonProps) {
  return (
    <div className="flex gap-2">
      <BrandFormDialog
        open={open}
        onOpenChange={onOpenChange}
        initialData={initialData}
        onSuccess={onSuccess}
      />
    </div>
  );
}
