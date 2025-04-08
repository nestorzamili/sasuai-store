'use client';

import RewardFormDialog from './reward-form-dialog';
import { RewardWithClaimCount } from '@/lib/types/reward';

// Define props type
interface RewardPrimaryButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: RewardWithClaimCount;
  onSuccess?: () => void;
}

export default function RewardPrimaryButton({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: RewardPrimaryButtonProps) {
  return (
    <div className="flex gap-2">
      <RewardFormDialog
        open={open}
        onOpenChange={onOpenChange}
        initialData={initialData}
        onSuccess={onSuccess}
      />
    </div>
  );
}
