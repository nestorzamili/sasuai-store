'use client';

import { ProductBatchFormInitialData } from '@/lib/types/product-batch';
import { Product } from '@prisma/client';
import BatchFormDialog from './batch-form-dialog';
import { SupplierWithCount } from '@/lib/types/supplier';
import { UnitWithCounts } from '@/lib/types/unit';

// Define props type
interface BatchPrimaryButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: ProductBatchFormInitialData;
  products: Product[];
  units: UnitWithCounts[];
  suppliers: SupplierWithCount[];
  onSuccess?: () => void;
}

export default function BatchPrimaryButton({
  open,
  onOpenChange,
  initialData,
  products,
  units,
  suppliers,
  onSuccess,
}: BatchPrimaryButtonProps) {
  return (
    <div className="flex gap-2">
      <BatchFormDialog
        open={open}
        onOpenChange={onOpenChange}
        initialData={initialData}
        products={products}
        units={units}
        suppliers={suppliers}
        onSuccess={onSuccess}
      />
    </div>
  );
}
