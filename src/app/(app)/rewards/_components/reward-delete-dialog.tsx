'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('reward.deleteDialog');
  const [isDeleting, setIsDeleting] = useState(false);

  const hasClaims = !!(
    reward._count?.rewardClaims && reward._count.rewardClaims > 0
  );

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (hasClaims) {
        toast({
          title: t('error.failed'),
          description: t('hasClaimsWarning'),
          variant: 'destructive',
        });
        onOpenChange(false);
        return;
      }

      const result = await deleteReward(reward.id);

      if (result.success) {
        toast({
          title: t('success'),
          description: t('successMessage', { name: reward.name }),
        });
        onSuccess?.();
      } else {
        toast({
          title: t('error.failed'),
          description: result.error || t('error.failedToDelete'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Delete reward error:', error);
      toast({
        title: t('error.failed'),
        description: t('error.unexpected'),
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
          {t('title')}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            {t('description')} <span className="font-bold">{reward.name}</span>?
            <br />
            {t('content')}
          </p>

          {hasClaims ? (
            <Alert variant="destructive">
              <AlertTitle>{t('cannotDelete')}</AlertTitle>
              <AlertDescription>{t('hasClaimsWarning')}</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>{t('warning')}</AlertTitle>
              <AlertDescription>{t('actionUndone')}</AlertDescription>
            </Alert>
          )}

          {/* Reward details section */}
          <div className="bg-muted p-3 rounded-md space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('rewardName')}:</span>
              <span className="font-medium">{reward.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('pointsCost')}:</span>
              <span className="font-medium">{reward.pointsCost}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('stock')}:</span>
              <span className="font-medium">{reward.stock}</span>
            </div>
          </div>
        </div>
      }
      confirmText={isDeleting ? t('deleting') : t('deleteButton')}
      destructive
    />
  );
}
