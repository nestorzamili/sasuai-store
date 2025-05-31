'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('member.tierDeleteDialog');
  const tCommon = useTranslations('member.common');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const result = await deleteMemberTier(tier.id);

      if (result.success) {
        toast({
          title: t('success'),
          description: t('successMessage', { name: tier.name }),
        });
        onSuccess?.();
      } else {
        toast({
          title: tCommon('error'),
          description: result.error || t('failed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to delete member tier:', error);
      toast({
        title: tCommon('error'),
        description: tCommon('unexpectedError'),
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
          {t('title')}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            {t('description', { name: tier.name })}
            <br />
            {t('permanentRemove')}
          </p>

          <Alert variant="destructive">
            <AlertTitle>{t('warning')}</AlertTitle>
            <AlertDescription>{t('warningMessage')}</AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isDeleting ? t('deleting') : t('deleteButton')}
      destructive
    />
  );
}
