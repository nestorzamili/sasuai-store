'use client';

import { useState } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { deleteDiscount } from '../action';
import { DiscountWithCounts } from '@/lib/types/discount';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount: DiscountWithCounts;
  onSuccess?: () => void;
}

export function DiscountDeleteDialog({
  open,
  onOpenChange,
  discount,
  onSuccess,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if discount has been used in transactions
  const hasBeenUsed =
    discount._count?.transactions > 0 || discount._count?.transactionItems > 0;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // This would call a delete endpoint when implemented
      const result = await deleteDiscount(discount.id);

      if (result.success) {
        toast({
          title: 'Discount deleted',
          description: `The discount "${discount.name}" has been deleted successfully`,
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to delete discount',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
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
      disabled={isDeleting || hasBeenUsed}
      title={
        <span className="text-destructive">
          <IconAlertTriangle
            className="mr-1 inline-block stroke-destructive"
            size={18}
          />{' '}
          Delete Discount
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete{' '}
            <span className="font-bold">{discount.name}</span>?
            <br />
            This action will permanently remove this discount from the system.
            This cannot be undone.
          </p>

          {hasBeenUsed ? (
            <Alert variant="destructive">
              <AlertTitle>Cannot Delete</AlertTitle>
              <AlertDescription>
                This discount has been used in transactions and cannot be
                deleted. You can disable it instead by setting it to inactive.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>Warning!</AlertTitle>
              <AlertDescription>
                Please be careful, this operation cannot be rolled back.
              </AlertDescription>
            </Alert>
          )}
        </div>
      }
      confirmText={isDeleting ? 'Deleting...' : 'Delete'}
      destructive
    />
  );
}
