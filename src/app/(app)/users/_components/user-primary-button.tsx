'use client';

import { User } from '@/lib/types/user';
import UserFormDialog from './user-form-dialog';

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
  const isEditing = Boolean(initialData?.id);

  // If we're editing, don't render the button since edit is triggered from the table
  if (isEditing) {
    return null;
  }

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
