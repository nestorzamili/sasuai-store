'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { UnitConversionWithUnits } from '@/lib/types/unit';
import { deleteConversion } from '../conversion-actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversion: UnitConversionWithUnits;
  onSuccess?: () => void;
}

export function UnitConversionDeleteDialog({
  open,
  onOpenChange,
  conversion,
  onSuccess,
}: Props) {
  const t = useTranslations('unit.conversionDeleteDialog');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const result = await deleteConversion(conversion.id);

      if (result.success) {
        toast({
          title: t('success'),
          description: t('successMessage'),
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
      console.error('Unit conversion delete error:', error);
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
            {t('description', {
              fromUnit: conversion.fromUnit.name,
              fromSymbol: conversion.fromUnit.symbol,
              toUnit: conversion.toUnit.name,
              toSymbol: conversion.toUnit.symbol,
            })}
            <br />
            {t('actionUndone')}
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
