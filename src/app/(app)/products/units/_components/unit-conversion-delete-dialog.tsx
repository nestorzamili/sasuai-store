'use client';

import { useState } from 'react';
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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const result = await deleteConversion(conversion.id);

      if (result.success) {
        toast({
          title: 'Conversion deleted',
          description: `The unit conversion has been deleted successfully`,
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete unit conversion',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Unit conversion delete error:', error);
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
          Delete Unit Conversion
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete this conversion from{' '}
            <span className="font-bold">
              {conversion.fromUnit.name} ({conversion.fromUnit.symbol})
            </span>{' '}
            to{' '}
            <span className="font-bold">
              {conversion.toUnit.name} ({conversion.toUnit.symbol})
            </span>
            ?
            <br />
            This action cannot be undone.
          </p>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              This conversion may be used for unit conversions in the system.
              Removing it might affect inventory calculations.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isDeleting ? 'Deleting...' : 'Delete'}
      destructive
    />
  );
}
