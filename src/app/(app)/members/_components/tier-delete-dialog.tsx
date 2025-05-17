'use client';

import { useState } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { MemberTier } from '@/lib/types/member';
import { deleteMemberTier } from '../action';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: MemberTier;
  onSuccess?: () => void;
}

export default function TierDeleteDialog({
  open,
  onOpenChange,
  tier,
  onSuccess,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const result = await deleteMemberTier(tier.id);

      if (result.success) {
        toast({
          title: 'Tier deleted',
          description: `The tier "${tier.name}" has been deleted successfully`,
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete tier',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={isDeleting}
      title={
        <span className="text-destructive">
          <IconAlertTriangle
            className="mr-1 inline-block stroke-destructive"
            size={18}
          />{' '}
          Delete Membership Tier
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete{' '}
            <span className="font-bold">{tier.name}</span> tier?
            <br />
            This action will permanently remove this membership tier from the
            system.
          </p>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              If any members are currently assigned to this tier, the operation
              will fail. You need to reassign those members to a different tier
              first.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isDeleting ? 'Deleting...' : 'Delete Tier'}
      destructive
    />
  );
}
