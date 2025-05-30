'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { BrandWithCount } from '@/lib/types/brand';
import { deleteBrand } from '../action';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: BrandWithCount;
  onSuccess?: () => void;
}

export function BrandDeleteDialog({
  open,
  onOpenChange,
  brand,
  onSuccess,
}: Props) {
  const t = useTranslations('brand.deleteDialog');
  const [isDeleting, setIsDeleting] = useState(false);

  const hasProducts = !!(brand._count?.products && brand._count.products > 0);

  const handleDelete = useCallback(async () => {
    try {
      setIsDeleting(true);

      if (hasProducts) {
        toast({
          title: t('cannotDeleteTitle'),
          description: t('cannotDeleteMessage', {
            count: brand._count?.products || 0,
          }),
          variant: 'destructive',
        });
        onOpenChange(false);
        return;
      }

      const result = await deleteBrand(brand.id);

      if (result.success) {
        toast({
          title: t('success'),
          description: t('successMessage', { name: brand.name }),
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
      console.error('Failed to delete brand:', error);
      toast({
        title: t('error'),
        description: t('unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  }, [brand, hasProducts, onOpenChange, onSuccess, t]);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={isDeleting || hasProducts}
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
            {t('description', { name: brand.name })}
            <br />
            {t('permanentRemove')}
          </p>

          {hasProducts ? (
            <Alert variant="destructive">
              <AlertTitle>{t('cannotDelete')}</AlertTitle>
              <AlertDescription>
                {t('hasProducts', { count: brand._count?.products || 0 })}
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
