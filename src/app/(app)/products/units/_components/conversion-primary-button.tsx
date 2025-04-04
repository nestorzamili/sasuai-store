'use client';

import { UnitConversionWithUnits, UnitWithCounts } from '@/lib/types/unit';
import UnitConversionFormDialog from './unit-conversion-form-dialog';

// Define props type
interface ConversionPrimaryButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  units: UnitWithCounts[];
  initialData?: UnitConversionWithUnits;
  onSuccess?: () => void;
}

export default function ConversionPrimaryButton({
  open,
  onOpenChange,
  units,
  initialData,
  onSuccess,
}: ConversionPrimaryButtonProps) {
  return (
    <div className="flex gap-2">
      <UnitConversionFormDialog
        open={open}
        onOpenChange={onOpenChange}
        units={units}
        initialData={initialData}
        onSuccess={onSuccess}
      />
    </div>
  );
}
