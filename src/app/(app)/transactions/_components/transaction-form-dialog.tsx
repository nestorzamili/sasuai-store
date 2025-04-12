'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TransactionWithRelations } from '@/lib/types/transaction';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IconPlus } from '@tabler/icons-react';
import { TransactionForm } from './transaction-form';

interface TransactionFormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: TransactionWithRelations;
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
  size?: 'default' | 'large';
  title?: string;
  description?: string;
}

export default function TransactionFormDialog({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  initialData,
  onSuccess,
  triggerButton,
  size = 'large',
  title,
  description,
}: TransactionFormDialogProps) {
  // Handle uncontrolled vs controlled state
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  // Determine if we're in controlled or uncontrolled mode
  const isControlled =
    controlledOpen !== undefined && setControlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? setControlledOpen : setUncontrolledOpen;

  // Determine if we're in edit mode
  const isEditing = Boolean(initialData?.id);

  // Dynamic content based on props or defaults
  const dialogTitle =
    title || (isEditing ? 'View Transaction' : 'New Transaction');
  const dialogDescription =
    description ||
    (isEditing ? 'View transaction details' : 'Create a new transaction');

  // Default trigger button if not provided
  const defaultTriggerButton = (
    <Button variant="default" className="space-x-1">
      <span>New Transaction</span> <IconPlus size={18} />
    </Button>
  );

  // Handle successful transaction completion
  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  // Handle cancel action
  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTriggerButton}
      </DialogTrigger>
      <DialogContent
        className={`max-h-[90vh] overflow-y-auto ${
          size === 'large' ? 'sm:max-w-[900px]' : 'sm:max-w-[600px]'
        }`}
      >
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <TransactionForm
          initialData={initialData}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
