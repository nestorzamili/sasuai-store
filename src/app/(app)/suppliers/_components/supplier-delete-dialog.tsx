'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { canDeleteSupplier, deleteSupplier } from '../action';
import { SupplierWithCount } from '@/lib/types/supplier';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: SupplierWithCount;
  onSuccess?: () => void;
}

export function SupplierDeleteDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: Props) {
  const t = useTranslations('supplier.deleteDialog');
  const [isDeleting, setIsDeleting] = useState(false);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [isCheckingDelete, setIsCheckingDelete] = useState(false);

  // Check if the supplier can be deleted when the dialog opens
  useEffect(() => {
    if (open) {
      const checkCanDelete = async () => {
        setIsCheckingDelete(true);
        try {
          const result = await canDeleteSupplier(supplier.id);
          if (result.success) {
            setCanDelete(result.canDelete);
          } else {
            setCanDelete(false);
          }
        } catch (error) {
          console.error('Error checking if supplier can be deleted:', error);
          setCanDelete(false);
        } finally {
          setIsCheckingDelete(false);
        }
      };

      checkCanDelete();
    }
  }, [open, supplier.id]);

  const handleDelete = useCallback(async () => {
    try {
      setIsDeleting(true);

      // Double-check if the supplier can be deleted
      const canDeleteCheck = await canDeleteSupplier(supplier.id);

      if (!canDeleteCheck.success || !canDeleteCheck.canDelete) {
        toast({
          title: t('cannotDeleteTitle'),
          description: t('cannotDeleteMessage'),
          variant: 'destructive',
        });
        onOpenChange(false);
        return;
      }

      const result = await deleteSupplier(supplier.id);

      if (result.success) {
        toast({
          title: t('success'),
          description: t('successMessage', { name: supplier.name }),
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
      console.error('Error deleting supplier:', error);
      toast({
        title: t('error'),
        description: t('unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  }, [supplier.id, supplier.name, onOpenChange, onSuccess, t]);

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
            {t('description', { name: supplier.name })}
            <br />
            {t('permanentRemove')}
          </p>

          {isCheckingDelete ? (
            <Alert>
              <AlertTitle>{t('checkingStatus')}</AlertTitle>
              <AlertDescription>{t('pleaseWait')}</AlertDescription>
            </Alert>
          ) : canDelete === false ? (
            <Alert variant="destructive">
              <AlertTitle>{t('cannotDelete')}</AlertTitle>
              <AlertDescription>
                {t('inUse', { count: supplier._count?.stockIns || 0 })}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>{t('warning')}</AlertTitle>
              <AlertDescription>{t('warningMessage')}</AlertDescription>
            </Alert>
          )}
        </div>
      }
      confirmText={isDeleting ? t('deleting') : t('deleteButton')}
      destructive
    />
  );
}
