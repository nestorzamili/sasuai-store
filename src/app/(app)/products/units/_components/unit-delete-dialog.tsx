'use client';

import { useState } from 'react';
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
  const [isDeleting, setIsDeleting] = useState(false);

  const isInUse = !!(
    (unit._count?.productVariants && unit._count.productVariants > 0) ||
    (unit._count?.stockIns && unit._count.stockIns > 0) ||
    (unit._count?.stockOuts && unit._count.stockOuts > 0) ||
    (unit._count?.transactionItems && unit._count.transactionItems > 0)
  );

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (isInUse) {
        toast({
          title: 'Cannot Delete Unit',
          description: `This unit is currently in use and cannot be deleted.`,
          variant: 'destructive',
        });
        onOpenChange(false);
        return;
      }

      const result = await deleteUnit(unit.id);

      if (result.success) {
        toast({
          title: 'Unit deleted',
          description: `The unit "${unit.name}" has been deleted successfully`,
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete unit',
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

  // Calculate usage details for error message
  const usageDetails = () => {
    const items = [];
    const counts = unit._count || {};

    if (counts.productVariants && counts.productVariants > 0) {
      items.push(`${counts.productVariants} product variants`);
    }
    if (counts.stockIns && counts.stockIns > 0) {
      items.push(`${counts.stockIns} stock-in records`);
    }
    if (counts.stockOuts && counts.stockOuts > 0) {
      items.push(`${counts.stockOuts} stock-out records`);
    }
    if (counts.transactionItems && counts.transactionItems > 0) {
      items.push(`${counts.transactionItems} transaction items`);
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
          Delete Unit
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete{' '}
            <span className="font-bold">
              {unit.name} ({unit.symbol})
            </span>
            ?
            <br />
            This action will permanently remove this unit from the system. This
            cannot be undone.
          </p>

          {isInUse ? (
            <Alert variant="destructive">
              <AlertTitle>Cannot Delete</AlertTitle>
              <AlertDescription>
                This unit is currently used in {usageDetails()}. You need to
                reassign or remove these references before deleting this unit.
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
