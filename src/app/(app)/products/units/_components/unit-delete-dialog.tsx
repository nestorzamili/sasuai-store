'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { UnitWithCounts } from '@/lib/types/unit';
import { deleteUnit } from '../action';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: UnitWithCounts;
  onSuccess?: () => void;
}

export function UnitDeleteDialog({
  open,
  onOpenChange,
  unit,
  onSuccess,
}: Props) {
  const t = useTranslations('unit.deleteDialog');
  const [isDeleting, setIsDeleting] = useState(false);

  const isInUse = !!(
    (unit._count?.products && unit._count.products > 0) ||
    (unit._count?.stockIns && unit._count.stockIns > 0) ||
    (unit._count?.stockOuts && unit._count.stockOuts > 0) ||
    (unit._count?.transactionItems && unit._count.transactionItems > 0)
  );

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (isInUse) {
        toast({
          title: t('cannotDeleteTitle'),
          description: t('cannotDeleteMessage'),
          variant: 'destructive',
        });
        onOpenChange(false);
        return;
      }

      const result = await deleteUnit(unit.id);

      if (result.success) {
        toast({
          title: t('success'),
          description: t('successMessage', { name: unit.name }),
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
      console.error('Unit delete error:', error);
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

  // Calculate usage details for error message
  const usageDetails = () => {
    const items: string[] = [];
    const counts = unit._count || {};

    if (counts.products && counts.products > 0) {
      items.push(`${counts.products} ${t('usage.products')}`);
    }
    if (counts.stockIns && counts.stockIns > 0) {
      items.push(`${counts.stockIns} ${t('usage.stockInRecords')}`);
    }
    if (counts.stockOuts && counts.stockOuts > 0) {
      items.push(`${counts.stockOuts} ${t('usage.stockOutRecords')}`);
    }
    if (counts.transactionItems && counts.transactionItems > 0) {
      items.push(`${counts.transactionItems} ${t('usage.transactionItems')}`);
    }

    return items.join(', ');
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={isDeleting || isInUse}
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
            {t('description', { name: unit.name, symbol: unit.symbol })}
            <br />
            {t('permanentRemove')}
          </p>

          {isInUse ? (
            <Alert variant="destructive">
              <AlertTitle>{t('cannotDelete')}</AlertTitle>
              <AlertDescription>
                {t('inUse', { usage: usageDetails() })}
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
