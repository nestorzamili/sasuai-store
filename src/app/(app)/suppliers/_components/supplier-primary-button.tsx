'use client';

import SupplierFormDialog from './supplier-form-dialog';
import { SupplierFormInitialData } from '@/lib/types/supplier';

// Define props type
interface SupplierPrimaryButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: SupplierFormInitialData;
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
