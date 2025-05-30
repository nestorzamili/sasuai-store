'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ProductWithRelations } from '@/lib/types/product';
import { deleteProduct } from '../action';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithRelations;
  onSuccess?: () => void;
}

export function ProductDeleteDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: Props) {
  const t = useTranslations('product.deleteDialog');
  const tCommon = useTranslations('common');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const result = await deleteProduct(product.id);

      if (result.success) {
        toast({
          title: t('success'),
          description: t('successMessage', { name: product.name }),
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
      console.error('Error deleting product:', error);
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
            {t('description', { name: product.name })}
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
