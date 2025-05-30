'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { CategoryWithCount } from '@/lib/types/category';
import { deleteCategory } from '../action';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryWithCount;
  onSuccess?: () => void;
}

export function CategoryDeleteDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: Props) {
  const t = useTranslations('category.deleteDialog');
  const [isDeleting, setIsDeleting] = useState(false);

  const hasProducts = !!(
    category._count?.products && category._count.products > 0
  );

  const handleDelete = useCallback(async () => {
    try {
      setIsDeleting(true);

      if (hasProducts) {
        toast({
          title: t('cannotDeleteTitle'),
          description: t('cannotDeleteMessage', {
            count: category._count?.products || 0,
          }),
          variant: 'destructive',
        });
        onOpenChange(false);
        return;
      }

      const result = await deleteCategory(category.id);

      if (result.success) {
        toast({
          title: t('success'),
          description: t('successMessage', { name: category.name }),
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
      console.error('Category delete error:', error);
      toast({
        title: t('error'),
        description: t('unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  }, [category, hasProducts, onOpenChange, onSuccess, t]);

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
            {t('description', { name: category.name })}
            <br />
            {t('permanentRemove')}
          </p>

          {hasProducts ? (
            <Alert variant="destructive">
              <AlertTitle>{t('cannotDelete')}</AlertTitle>
              <AlertDescription>
                {t('hasProducts', { count: category._count?.products || 0 })}
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
