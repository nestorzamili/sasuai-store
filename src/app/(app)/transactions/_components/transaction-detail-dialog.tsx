'use client';

import { useEffect, useState } from 'react';
import { getTransactionById } from '../action';
import { formatRupiah } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
}

export function TransactionDetailDialog({
  open,
  onOpenChange,
  transactionId,
}: TransactionDetailDialogProps) {
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!open || !transactionId) return;

      try {
        setLoading(true);
        const result = await getTransactionById(transactionId);

        if (result.success) {
          setTransaction(result.data);
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to load transaction details',
            variant: 'destructive',
          });
        }
      } catch (err) {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [open, transactionId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            Transaction: {!loading && transaction ? transaction.tranId : ''}
          </DialogTitle>
          {!loading && transaction && (
            <div className="flex justify-between items-center gap-2">
              <div className="text-sm text-muted-foreground">
                {new Date(transaction?.createdAt).toLocaleString()}
              </div>
              <Badge variant="outline" className="px-3 py-1">
                {transaction?.payment?.method || 'Unknown'}
              </Badge>
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : transaction ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Transaction ID
                      </p>
                      <p className="font-medium truncate">
                        {transaction?.tranId || transaction?.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Internal ID
                      </p>
                      <p className="font-medium text-muted-foreground text-sm">
                        {transaction?.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cashier</p>
                      <p className="font-medium">
                        {transaction?.cashier?.name || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Member</p>
                      <p className="font-medium">
                        {transaction?.member?.name || 'None'}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Items</h3>
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left">Product</th>
                            <th className="p-2 text-center">Quantity</th>
                            <th className="p-2 text-right">Price</th>
                            <th className="p-2 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(transaction?.items || []).map(
                            (item: any, index: number) => (
                              <tr key={item?.id || index} className="border-t">
                                <td className="p-2">
                                  <div>
                                    <p className="font-medium">
                                      {item?.product?.name || 'Unknown Product'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {item?.unit?.name || 'Unknown Unit'}
                                    </p>
                                  </div>
                                </td>
                                <td className="p-2 text-center">
                                  {item?.quantity || 0}
                                </td>
                                <td className="p-2 text-right">
                                  {formatRupiah(item?.pricePerUnit || 0)}
                                </td>
                                <td className="p-2 text-right">
                                  {formatRupiah(item?.subtotal || 0)}
                                </td>
                              </tr>
                            ),
                          )}
                          {(!transaction?.items ||
                            transaction.items.length === 0) && (
                            <tr>
                              <td
                                colSpan={4}
                                className="p-4 text-center text-muted-foreground"
                              >
                                No items found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>
                        {formatRupiah(
                          transaction?.pricing?.originalAmount || 0,
                        )}
                      </span>
                    </div>
                    {(transaction?.pricing?.discounts?.total > 0 ||
                      transaction?.pricing?.totalDiscount > 0) && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Discount</span>
                        <span>
                          -{' '}
                          {formatRupiah(
                            transaction?.pricing?.discounts?.total ||
                              transaction?.pricing?.totalDiscount ||
                              0,
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>
                        {formatRupiah(transaction?.pricing?.finalAmount || 0)}
                      </span>
                    </div>
                    {transaction?.payment?.method === 'CASH' && (
                      <>
                        <div className="flex justify-between">
                          <span>Cash Amount</span>
                          <span>
                            {formatRupiah(
                              transaction?.payment?.amount ||
                                transaction?.payment?.cashAmount ||
                                0,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Change</span>
                          <span>
                            {formatRupiah(
                              transaction?.payment?.change ||
                                (transaction?.payment?.amount ||
                                  transaction?.payment?.cashAmount ||
                                  0) - (transaction?.pricing?.finalAmount || 0),
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center p-6">
              <h3 className="text-lg font-medium">Transaction not found</h3>
              <p className="text-muted-foreground">
                The requested transaction could not be found.
              </p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
