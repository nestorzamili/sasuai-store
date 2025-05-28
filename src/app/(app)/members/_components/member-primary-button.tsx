'use client';

import MemberFormDialog from './member-form-dialog';
import { MemberWithTier, MemberTier } from '@/lib/types/member';

// Define props type
interface MemberPrimaryButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: MemberWithTier;
  tiers: MemberTier[];
  onSuccess?: () => void;
}

export default function MemberPrimaryButton({
  open,
  onOpenChange,
  initialData,
  tiers,
  onSuccess,
}: MemberPrimaryButtonProps) {
  return (
    <div className="flex gap-2">
      <MemberFormDialog
        open={open}
        onOpenChange={onOpenChange}
        initialData={initialData}
        tiers={tiers}
        onSuccess={onSuccess}
      />
    </div>
  );
}
