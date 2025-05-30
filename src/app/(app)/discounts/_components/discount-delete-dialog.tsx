'use client';

import { useState } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { deleteDiscount } from '../action';
import { DiscountWithCounts } from '@/lib/types/discount';
import { useTranslations } from 'next-intl';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount: DiscountWithCounts;
  onSuccess?: () => void;
}

export function DiscountDeleteDialog({
  open,
  onOpenChange,
  discount,
  onSuccess,
}: Props) {
  const t = useTranslations('discount.deleteDialog');
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if discount has been used in transactions
  const hasBeenUsed =
    discount._count?.transactions > 0 || discount._count?.transactionItems > 0;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const result = await deleteDiscount(discount.id);

      if (result.success) {
        toast({
          title: t('success'),
          description: `${discount.name} ${t('successMessage')}`,
        });
        onSuccess?.();
      } else {
        toast({
          title: t('error'),
          description: result.message || t('failedToDelete'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast({
        title: t('error'),
        description: t('unexpectedError'),
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
      disabled={isDeleting || hasBeenUsed}
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
            {t('description')}{' '}
            <span className="font-bold">{discount.name}</span>?
            <br />
            {t('permanentRemove')}
          </p>

          {hasBeenUsed ? (
            <Alert variant="destructive">
              <AlertTitle>{t('cannotDelete')}</AlertTitle>
              <AlertDescription>{t('hasBeenUsed')}</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>{t('warning')}</AlertTitle>
              <AlertDescription>{t('carefulOperation')}</AlertDescription>
            </Alert>
          )}
        </div>
      }
      confirmText={isDeleting ? t('deleting') : t('deleteButton')}
      destructive
    />
  );
}
