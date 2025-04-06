'use client';

import UserFormDialog from './user-form-dialog';
import { User } from './main-content';

// Define props type
interface UserPrimaryButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: User;
  onSuccess?: () => void;
}

export default function UserPrimaryButton({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: UserPrimaryButtonProps) {
  return (
    <div className="flex gap-2">
      <UserFormDialog
        open={open}
        onOpenChange={onOpenChange}
        initialData={initialData}
        onSuccess={onSuccess}
      />
    </div>
  );
}
