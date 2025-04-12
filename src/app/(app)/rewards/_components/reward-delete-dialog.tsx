'use client';

import { useState } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { RewardWithClaimCount } from '@/lib/types/reward';
import { deleteReward } from '../actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: RewardWithClaimCount;
  onSuccess?: () => void;
}

export function RewardDeleteDialog({
  open,
  onOpenChange,
  reward,
  onSuccess,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const hasClaims = !!(
    reward._count?.rewardClaims && reward._count.rewardClaims > 0
  );

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (hasClaims) {
        toast({
          title: 'Cannot Delete Reward',
          description: `This reward has been claimed ${reward._count?.rewardClaims} times. It cannot be deleted.`,
          variant: 'destructive',
        });
        onOpenChange(false);
        return;
      }

      const result = await deleteReward(reward.id);

      if (result.success) {
        toast({
          title: 'Reward deleted',
          description: `The reward "${reward.name}" has been deleted successfully`,
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete reward',
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
      disabled={isDeleting || hasClaims}
      title={
        <span className="text-destructive">
          <IconAlertTriangle
            className="mr-1 inline-block stroke-destructive"
            size={18}
          />{' '}
          Delete Reward
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete{' '}
            <span className="font-bold">{reward.name}</span>?
            <br />
            This action will permanently remove this reward from the system.
            This cannot be undone.
          </p>

          {hasClaims ? (
            <Alert variant="destructive">
              <AlertTitle>Cannot Delete</AlertTitle>
              <AlertDescription>
                This reward has been claimed {reward._count?.rewardClaims}{' '}
                times. Rewards with claim history cannot be deleted.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>Warning!</AlertTitle>
              <AlertDescription>
                Please be careful, this operation cannot be rolled back.
              </AlertDescription>
            </Alert>
          )}
        </div>
      }
      confirmText={isDeleting ? 'Deleting...' : 'Delete'}
      destructive
    />
  );
}
