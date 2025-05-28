'use client';

import React from 'react';
import { useState } from 'react';
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
        title: 'Invalid adjustment',
        description: 'Adjustment quantity cannot be zero',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.reason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for the adjustment',
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
          title: 'Quantity adjusted',
          description: 'Batch quantity has been adjusted successfully',
        });
        onSuccess();
        onOpenChange(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to adjust quantity',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adjusting quantity:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
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
          <DialogTitle>Adjust Quantity</DialogTitle>
          <DialogDescription>
            Adjust the quantity for batch {batch.batchCode}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Current quantity info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Product:</span>{' '}
                  {batch.product?.name}
                </div>
                <div>
                  <span className="font-medium">Current Quantity:</span>{' '}
                  {batch.remainingQuantity}
                </div>
              </div>
            </div>

            {/* Adjustment input */}
            <div className="grid gap-2">
              <Label htmlFor="adjustment">Adjustment</Label>
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
                placeholder="Enter adjustment (positive to add, negative to subtract)"
                required
              />
              <div className="text-xs text-muted-foreground">
                New quantity will be: {newQuantity}{' '}
                {newQuantity < 0 && (
                  <span className="text-destructive ml-1">
                    (Cannot be negative)
                  </span>
                )}
              </div>
            </div>

            {/* Unit selection */}
            <div className="grid gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                value={formData.unitId}
                onValueChange={(value) =>
                  setFormData({ ...formData, unitId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
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
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Enter reason for adjustment"
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
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || newQuantity < 0}>
              {isLoading ? 'Adjusting...' : 'Adjust Quantity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
