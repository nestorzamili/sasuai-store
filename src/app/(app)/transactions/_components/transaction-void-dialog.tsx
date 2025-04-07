'use client';

import { useState } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { TransactionWithRelations } from '@/lib/types/transaction';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { voidTransaction } from '../action';
import { formatRupiah } from '@/lib/currency';
import { formatDateTime } from '@/lib/date';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionWithRelations;
  onSuccess?: () => void;
}

export function TransactionVoidDialog({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: Props) {
  const [isVoiding, setIsVoiding] = useState(false);
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  const handleVoid = async () => {
    if (!reason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for voiding this transaction',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsVoiding(true);
      const result = await voidTransaction(transaction.id, reason);

      if (result.success) {
        toast({
          title: 'Transaction voided',
          description: 'The transaction has been successfully voided',
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to void transaction',
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
      setIsVoiding(false);
      onOpenChange(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleVoid}
      disabled={isVoiding || !reason.trim()}
      title={
        <span className="text-destructive">
          <IconAlertTriangle
            className="mr-1 inline-block stroke-destructive"
            size={18}
          />{' '}
          Void Transaction
        </span>
      }
      desc={
        <div className="space-y-4">
          <p>
            Are you sure you want to void transaction{' '}
            <span className="font-bold">{transaction.id}</span>?
          </p>

          <div className="bg-muted p-3 rounded-md text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground">Date:</p>
                <p>{formatDateTime(transaction.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cashier:</p>
                <p>{transaction.cashier?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount:</p>
                <p className="font-medium">
                  {formatRupiah(transaction.finalAmount)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment Method:</p>
                <p>{transaction.paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for voiding transaction*</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for voiding this transaction"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              rows={3}
              required
            />
          </div>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              This will void this transaction and restore the inventory. This
              action cannot be undone.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isVoiding ? 'Voiding...' : 'Void Transaction'}
      destructive
    />
  );
}
