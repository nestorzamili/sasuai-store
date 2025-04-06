'use client';

import { useState, useEffect } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { canDeleteBatch, deleteBatch } from '../action';
import { ProductBatchWithProduct } from '@/lib/types/product-batch';
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
          title: 'Cannot Delete Batch',
          description: `This batch cannot be deleted as it has associated transactions or stock movements.`,
          variant: 'destructive',
        });
        onOpenChange(false);
        return;
      }

      const result = await deleteBatch(batch.id);

      if (result.success) {
        toast({
          title: 'Batch deleted',
          description: `Batch "${batch.batchCode}" for ${batch.product.name} has been deleted successfully`,
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete batch',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
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
          Delete Batch
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete batch{' '}
            <span className="font-bold">{batch.batchCode}</span> for{' '}
            <span className="font-bold">{batch.product.name}</span>?
            <br />
            This action will permanently remove this batch and its initial
            stock-in record.
          </p>

          <div className="space-y-1">
            <p>
              <span className="font-semibold">Product:</span>{' '}
              {batch.product.name}
            </p>
            <p>
              <span className="font-semibold">Batch Code:</span>{' '}
              {batch.batchCode}
            </p>
            <p>
              <span className="font-semibold">Expiry Date:</span>{' '}
              {format(new Date(batch.expiryDate), 'PPP')}
            </p>
            <p>
              <span className="font-semibold">Initial Quantity:</span>{' '}
              {batch.initialQuantity}
            </p>
            <p>
              <span className="font-semibold">Current Quantity:</span>{' '}
              {batch.remainingQuantity}
            </p>
          </div>

          {isCheckingDelete ? (
            <Alert>
              <AlertTitle>Checking batch status...</AlertTitle>
              <AlertDescription>
                Please wait while we check if this batch can be deleted.
              </AlertDescription>
            </Alert>
          ) : canDelete === false ? (
            <Alert variant="destructive">
              <AlertTitle>Cannot Delete</AlertTitle>
              <AlertDescription>
                This batch cannot be deleted because it has associated
                transactions or stock movements. Only batches that haven't been
                used in any transactions or stock adjustments can be deleted.
              </AlertDescription>
            </Alert>
          ) : isDifferentFromInitial ? (
            <Alert variant="destructive">
              <AlertTitle>Cannot Delete</AlertTitle>
              <AlertDescription>
                This batch cannot be deleted because its current quantity (
                {batch.remainingQuantity}) differs from its initial quantity (
                {batch.initialQuantity}), indicating it's been used.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>Warning!</AlertTitle>
              <AlertDescription>
                This will permanently remove the batch and its initial stock-in
                record. This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}
        </div>
      }
      confirmText={isDeleting ? 'Deleting...' : 'Delete Batch'}
      destructive
    />
  );
}
