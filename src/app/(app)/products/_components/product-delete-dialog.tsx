'use client';

import { useState } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ProductWithRelations } from '@/lib/types/product';
import { deleteProduct } from '../action';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithRelations;
  onSuccess?: () => void;
}

export function ProductDeleteDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const result = await deleteProduct(product.id);

      if (result.success) {
        toast({
          title: 'Product deleted',
          description: `The product "${product.name}" has been deleted successfully`,
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete product',
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
      disabled={isDeleting}
      title={
        <span className="text-destructive">
          <IconAlertTriangle
            className="mr-1 inline-block stroke-destructive"
            size={18}
          />{' '}
          Delete Product
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete the product{' '}
            <span className="font-bold">{product.name}</span>?
            <br />
            This action will permanently remove this product from the system.
            This cannot be undone.
          </p>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              This will also delete all associated product images and batch
              data. Please be careful, this operation cannot be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isDeleting ? 'Deleting...' : 'Delete'}
      destructive
    />
  );
}
