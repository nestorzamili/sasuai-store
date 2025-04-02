'use client';

import SupplierFormDialog from './supplier-form-dialog';
import { Supplier } from '@prisma/client';

// Define props type
interface SupplierPrimaryButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: Supplier & {
    _count?: {
      stockIns: number;
    };
  };
  onSuccess?: () => void;
}

export default function SupplierPrimaryButton({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: SupplierPrimaryButtonProps) {
  return (
    <div className="flex gap-2">
      <SupplierFormDialog
        open={open}
        onOpenChange={onOpenChange}
        initialData={initialData}
        onSuccess={onSuccess}
      />
    </div>
  );
}
