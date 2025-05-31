'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { canDeleteBatch, deleteBatch } from '../action';
import { ProductBatchWithProduct } from '@/lib/types/inventory';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: ProductBatchWithProduct;
  onSuccess?: () => void;
}

export function BatchDeleteDialog({
  open,
  onOpenChange,
  batch,
  onSuccess,
}: Props) {
  const t = useTranslations('inventory.batchDeleteDialog');
  const [isDeleting, setIsDeleting] = useState(false);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [isCheckingDelete, setIsCheckingDelete] = useState(false);

  // Check if the batch has any stock movements beyond the initial stock-in
  const isDifferentFromInitial =
    batch.remainingQuantity !== batch.initialQuantity;

  // Check if the batch can be deleted when the dialog opens
  useEffect(() => {
    if (open) {
      const checkCanDelete = async () => {
        setIsCheckingDelete(true);
        try {
          const result = await canDeleteBatch(batch.id);
          if (result.success) {
            setCanDelete(result.canDelete);
          } else {
            setCanDelete(false);
          }
        } catch (error) {
          console.error('Error checking batch delete status:', error);
          setCanDelete(false);
        } finally {
          setIsCheckingDelete(false);
        }
      };

      checkCanDelete();
    }
  }, [open, batch.id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Double-check if the batch can be deleted
      const canDeleteCheck = await canDeleteBatch(batch.id);

      if (!canDeleteCheck.success || !canDeleteCheck.canDelete) {
        toast({
          title: t('cannotDeleteTitle'),
          description: t('cannotDeleteMessage'),
          variant: 'destructive',
        });
        onOpenChange(false);
        return;
      }

      const result = await deleteBatch(batch.id);

      if (result.success) {
        toast({
          title: t('success'),
          description: `${t('batchCode')} "${batch.batchCode}" ${t('forProduct')} ${batch.product.name} ${t('successMessage')}`,
        });
        onSuccess?.();
      } else {
        toast({
          title: t('error'),
          description: result.error || t('failedToDelete'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
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
      disabled={isDeleting || isCheckingDelete || canDelete === false}
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
            <span className="font-bold">{batch.batchCode}</span>{' '}
            {t('forProduct')}{' '}
            <span className="font-bold">{batch.product.name}</span>?
            <br />
            {t('permanentRemove')}
          </p>

          <div className="space-y-1">
            <p>
              <span className="font-semibold">{t('product')}:</span>{' '}
              {batch.product.name}
            </p>
            <p>
              <span className="font-semibold">{t('batchCode')}:</span>{' '}
              {batch.batchCode}
            </p>
            <p>
              <span className="font-semibold">{t('expiryDate')}:</span>{' '}
              {format(new Date(batch.expiryDate), 'PPP')}
            </p>
            <p>
              <span className="font-semibold">{t('initialQuantity')}:</span>{' '}
              {batch.initialQuantity}
            </p>
            <p>
              <span className="font-semibold">{t('currentQuantity')}:</span>{' '}
              {batch.remainingQuantity}
            </p>
          </div>

          {isCheckingDelete ? (
            <Alert>
              <AlertTitle>{t('checkingStatus')}</AlertTitle>
              <AlertDescription>{t('pleaseWait')}</AlertDescription>
            </Alert>
          ) : canDelete === false ? (
            <Alert variant="destructive">
              <AlertTitle>{t('cannotDelete')}</AlertTitle>
              <AlertDescription>{t('hasTransactions')}</AlertDescription>
            </Alert>
          ) : isDifferentFromInitial ? (
            <Alert variant="destructive">
              <AlertTitle>{t('cannotDelete')}</AlertTitle>
              <AlertDescription>
                {t('quantityChanged')} ({batch.remainingQuantity}){' '}
                {t('differsFromInitial')} ({batch.initialQuantity}),{' '}
                {t('indicatingUsed')}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>{t('warning')}</AlertTitle>
              <AlertDescription>{t('actionUndone')}</AlertDescription>
            </Alert>
          )}
        </div>
      }
      confirmText={isDeleting ? t('deleting') : t('deleteButton')}
      destructive
    />
  );
}
