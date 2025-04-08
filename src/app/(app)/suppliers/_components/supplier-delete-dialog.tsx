'use client';

import { useState, useEffect } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { canDeleteSupplier, deleteSupplier } from '../action';
import { SupplierWithCount } from '@/lib/types/supplier';

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
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [isCheckingDelete, setIsCheckingDelete] = useState(false);

  const hasStockIns = !!(
    supplier._count?.stockIns && supplier._count.stockIns > 0
  );

  // Check if the supplier can be deleted when the dialog opens
  useEffect(() => {
    if (open) {
      const checkCanDelete = async () => {
        setIsCheckingDelete(true);
        try {
          const result = await canDeleteSupplier(supplier.id);
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
  }, [open, supplier.id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Double-check if the supplier can be deleted
      const canDeleteCheck = await canDeleteSupplier(supplier.id);

      if (!canDeleteCheck.success || !canDeleteCheck.canDelete) {
        toast({
          title: 'Cannot Delete Supplier',
          description: `This supplier has stock-in records associated with it. Remove these stock-in records first.`,
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
      disabled={isDeleting || isCheckingDelete || canDelete === false}
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

          {isCheckingDelete ? (
            <Alert>
              <AlertTitle>Checking supplier usage...</AlertTitle>
              <AlertDescription>
                Please wait while we check if this supplier can be deleted.
              </AlertDescription>
            </Alert>
          ) : canDelete === false ? (
            <Alert variant="destructive">
              <AlertTitle>Cannot Delete</AlertTitle>
              <AlertDescription>
                This supplier has stock-in records associated with it. You need
                to remove those records before deleting this supplier.
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
