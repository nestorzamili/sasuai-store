'use client';

import { useState } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { BrandWithCount } from '@/lib/types/brand';
import { deleteBrand } from '../action';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: BrandWithCount;
  onSuccess?: () => void;
}

export function BrandDeleteDialog({
  open,
  onOpenChange,
  brand,
  onSuccess,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const hasProducts = !!(brand._count?.products && brand._count.products > 0);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (hasProducts) {
        toast({
          title: 'Cannot Delete Brand',
          description: `This brand has ${brand._count?.products} products associated with it. Reassign or delete these products first.`,
          variant: 'destructive',
        });
        onOpenChange(false);
        return;
      }

      const result = await deleteBrand(brand.id);

      if (result.success) {
        toast({
          title: 'Brand deleted',
          description: `The brand "${brand.name}" has been deleted successfully`,
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete brand',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to delete brand:', error);
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
      disabled={isDeleting || hasProducts}
      title={
        <span className="text-destructive">
          <IconAlertTriangle
            className="mr-1 inline-block stroke-destructive"
            size={18}
          />{' '}
          Delete Brand
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete{' '}
            <span className="font-bold">{brand.name}</span>?
            <br />
            This action will permanently remove this brand from the system. This
            cannot be undone.
          </p>

          {hasProducts ? (
            <Alert variant="destructive">
              <AlertTitle>Cannot Delete</AlertTitle>
              <AlertDescription>
                This brand has {brand._count?.products} products associated with
                it. You need to reassign or delete those products before
                deleting this brand.
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
