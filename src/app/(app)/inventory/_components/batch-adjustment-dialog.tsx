'use client';

import React from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ProductBatchWithProduct } from '@/lib/types/inventory';
import { UnitWithCounts } from '@/lib/types/unit';
import { adjustBatchQuantity } from '../action';

interface BatchAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: ProductBatchWithProduct;
  units: UnitWithCounts[];
  onSuccess: () => void;
}

export function BatchAdjustmentDialog({
  open,
  onOpenChange,
  batch,
  units,
  onSuccess,
}: BatchAdjustmentDialogProps) {
  const t = useTranslations('inventory.batchAdjustmentDialog');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    adjustment: 0,
    reason: '',
    unitId: batch.product?.unit?.id || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.adjustment || formData.adjustment === 0) {
      toast({
        title: t('invalidAdjustment'),
        description: t('adjustmentCannotZero'),
        variant: 'destructive',
      });
      return;
    }

    if (!formData.reason.trim()) {
      toast({
        title: t('reasonRequired'),
        description: t('provideReason'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await adjustBatchQuantity(batch.id, {
        adjustment: formData.adjustment,
        reason: formData.reason,
        unitId: formData.unitId,
      });

      if (result.success) {
        toast({
          title: t('quantityAdjusted'),
          description: t('adjustmentSuccess'),
        });
        onSuccess();
        onOpenChange(false);
      } else {
        toast({
          title: t('error'),
          description: result.error || t('failedToAdjust'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adjusting quantity:', error);
      toast({
        title: t('error'),
        description: t('unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const newQuantity = batch.remainingQuantity + formData.adjustment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')} {batch.batchCode}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Current quantity info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="space-y-2">
                <div>
                  <span className="font-medium">{t('product')}:</span>{' '}
                  {batch.product?.name}
                </div>
                <div>
                  <span className="font-medium">{t('currentQuantity')}:</span>{' '}
                  {batch.remainingQuantity}
                </div>
              </div>
            </div>

            {/* Adjustment input */}
            <div className="grid gap-2">
              <Label htmlFor="adjustment">{t('adjustment')}</Label>
              <Input
                id="adjustment"
                type="number"
                value={formData.adjustment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    adjustment: parseInt(e.target.value) || 0,
                  })
                }
                placeholder={t('adjustmentPlaceholder')}
                required
              />
              <div className="text-xs text-muted-foreground">
                {t('newQuantity')}: {newQuantity}{' '}
                {newQuantity < 0 && (
                  <span className="text-destructive ml-1">
                    {t('cannotBeNegative')}
                  </span>
                )}
              </div>
            </div>

            {/* Unit selection */}
            <div className="grid gap-2">
              <Label htmlFor="unit">{t('unit')}</Label>
              <Select
                value={formData.unitId}
                onValueChange={(value) =>
                  setFormData({ ...formData, unitId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectUnit')} />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason input */}
            <div className="grid gap-2">
              <Label htmlFor="reason">{t('reason')}</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder={t('reasonPlaceholder')}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || newQuantity < 0}>
              {isLoading ? t('adjusting') : t('adjustQuantityButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
