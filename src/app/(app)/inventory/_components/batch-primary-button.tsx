'use client';

import { ProductBatchFormInitialData } from '@/lib/types/product-batch';
import { Product } from '@/lib/types/base-types'; // Updated import
import BatchFormDialog from './batch-form-dialog';
import { SupplierWithCount } from '@/lib/types/supplier';
import { UnitWithCounts } from '@/lib/types/unit';

// Define props type
interface BatchPrimaryButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: ProductBatchFormInitialData;
  onSuccess?: () => void;
}

export default function BatchPrimaryButton({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: BatchPrimaryButtonProps) {
  return (
    <div className="flex gap-2">
      <BatchFormDialog
        open={open}
        onOpenChange={onOpenChange}
        initialData={initialData}
        onSuccess={onSuccess}
      />
    </div>
  );
}
