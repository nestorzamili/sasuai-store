'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { User } from '@/lib/types/user';
import { removeUser } from '../action';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSuccess?: () => void;
}

export function UserDeleteDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: Props) {
  const t = useTranslations('user.deleteDialog');
  const tCommon = useTranslations('user.common');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const result = await removeUser({ userId: user.id });

      if (result.success) {
        toast({
          title: t('success'),
          description: t('successMessage', { name: user.name }),
        });
        onSuccess?.();
      } else {
        toast({
          title: tCommon('error'),
          description: result.error || t('error.failed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: tCommon('error'),
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
            {t('description')} <span className="font-bold">{user.name}</span>?
            <br />
            {t('content')}
          </p>

          <Alert variant="destructive">
            <AlertTitle>{t('warning')}</AlertTitle>
            <AlertDescription>{t('actionUndone')}</AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isDeleting ? t('deleting') : t('deleteButton')}
      destructive
    />
  );
}
