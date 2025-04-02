'use client';

import { useState } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Supplier } from '@prisma/client';
import { deleteSupplier } from '../action';

interface SupplierWithCount extends Supplier {
  _count?: {
    stockIns: number;
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: SupplierWithCount;
  onSuccess?: () => void;
}

export function SupplierDeleteDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const hasStockIns = !!(
    supplier._count?.stockIns && supplier._count.stockIns > 0
  );

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (hasStockIns) {
        toast({
          title: 'Cannot Delete Supplier',
          description: `This supplier has ${supplier._count?.stockIns} stock-ins associated with it. Remove these stock-in records first.`,
          variant: 'destructive',
        });
        onOpenChange(false);
        return;
      }

      const result = await deleteSupplier(supplier.id);

      if (result.success) {
        toast({
          title: 'Supplier deleted',
          description: `The supplier "${supplier.name}" has been deleted successfully`,
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete supplier',
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
      disabled={isDeleting || hasStockIns}
      title={
        <span className="text-destructive">
          <IconAlertTriangle
            className="mr-1 inline-block stroke-destructive"
            size={18}
          />{' '}
          Delete Supplier
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete{' '}
            <span className="font-bold">{supplier.name}</span>?
            <br />
            This action will permanently remove this supplier from the system.
            This cannot be undone.
          </p>

          {hasStockIns ? (
            <Alert variant="destructive">
              <AlertTitle>Cannot Delete</AlertTitle>
              <AlertDescription>
                This supplier has {supplier._count?.stockIns} stock-in records
                associated with it. You need to remove those records before
                deleting this supplier.
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
