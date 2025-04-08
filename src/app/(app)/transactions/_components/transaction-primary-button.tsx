'use client';

import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { TransactionWithRelations } from '@/lib/types/transaction';
import TransactionFormDialog from './transaction-form-dialog';

// Define props type
interface TransactionPrimaryButtonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: TransactionWithRelations;
  onSuccess?: () => void;
  label?: string;
}

export default function TransactionPrimaryButton({
  open,
  onOpenChange,
  initialData,
  onSuccess,
  label = 'New Transaction',
}: TransactionPrimaryButtonProps) {
  // Custom trigger button
  const triggerButton = (
    <Button variant="default" className="space-x-1">
      <span>{label}</span> <IconPlus size={18} />
    </Button>
  );

  return (
    <TransactionFormDialog
      open={open}
      onOpenChange={onOpenChange}
      initialData={initialData}
      onSuccess={onSuccess}
      triggerButton={triggerButton}
    />
  );
}
