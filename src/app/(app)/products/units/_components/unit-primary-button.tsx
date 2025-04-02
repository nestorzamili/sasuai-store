'use client';

import UnitFormDialog from './unit-form-dialog';
import { UnitWithCounts } from '@/lib/types/unit';

// Define props type
interface UnitPrimaryButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: UnitWithCounts;
  onSuccess?: () => void;
}

export default function UnitPrimaryButton({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: UnitPrimaryButtonProps) {
  return (
    <div className="flex gap-2">
      <UnitFormDialog
        open={open}
        onOpenChange={onOpenChange}
        initialData={initialData}
        onSuccess={onSuccess}
      />
    </div>
  );
}
