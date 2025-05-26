'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getTransactionById } from '../action';
import { formatRupiah } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
import { IconDownload } from '@tabler/icons-react';
import { pdf } from '@react-pdf/renderer';
import { TransactionPDF } from './transaction-generate-pdf';
import {
  TransactionDetailDialogProps,
  TransactionDetail,
  TransactionDetailItem,
} from '@/lib/types/transaction';

export function TransactionDetailDialog({
  open,
  onOpenChange,
  transactionId,
}: TransactionDetailDialogProps) {
  const [transaction, setTransaction] = useState<TransactionDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!open || !transactionId) return;

      try {
        setLoading(true);
        const result = await getTransactionById(transactionId);

        if (result.success && result.data && isMounted.current) {
          // Convert the API response to match the component's expected type
          const transactionData: TransactionDetail = {
            id: result.data.id,
            tranId: result.data.tranId,
            createdAt: result.data.createdAt.toString(), // Convert Date to string
            cashier: {
              name: result.data.cashier.name,
            },
            member: result.data.member
              ? {
                  id: result.data.member.id,
                  name: result.data.member.name,
                  tier: result.data.member.tier,
                }
              : null,
            pricing: {
              originalAmount: result.data.pricing.originalAmount,
              finalAmount: result.data.pricing.finalAmount,
              discounts: {
                member: result.data.pricing.discounts.member,
                products: result.data.pricing.discounts.products,
                total: result.data.pricing.discounts.total,
              },
            },
            payment: {
              method: result.data.payment.method,
              amount: result.data.payment.amount,
              change: result.data.payment.change,
            },
            items: result.data.items.map((item) => ({
              id: item.id,
              product: {
                name: item.product.name,
                price: item.product.price,
                unit: item.product.unit,
                category: item.product.category,
              },
              quantity: item.quantity,
              originalAmount: item.originalAmount,
              discountApplied: item.discountApplied
                ? {
                    id: item.discountApplied.id,
                    name: item.discountApplied.name,
                    amount: item.discountApplied.amount,
                  }
                : null,
            })),
            pointsEarned: result.data.pointsEarned,
          };

          setTransaction(transactionData);
        } else if (isMounted.current) {
          toast({
            title: 'Error',
            description: result.error || 'Failed to load transaction details',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching transaction details:', error);
        if (isMounted.current) {
          toast({
            title: 'Error',
            description: 'An unexpected error occurred',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchTransactionDetails();
  }, [open, transactionId]);

  // Memoize handlers
  const handlePdfGeneration = useCallback(async () => {
    if (!transaction) return;

    try {
      setPdfLoading(true);

      // Generate PDF blob
      const blob = await pdf(
        <TransactionPDF transaction={transaction} />,
      ).toBlob();

      // Create download link and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt-${transaction.tranId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);

      if (isMounted.current) {
        setPdfLoading(false);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    } finally {
      if (isMounted.current) {
        setPdfLoading(false);
      }
    }
  }, [transaction, isMounted]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {!loading && transaction
              ? `Transaction Receipt: ${transaction.tranId}`
              : 'Transaction Receipt'}
          </DialogTitle>
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
            <div className="space-y-6" id="transaction-details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {new Date(transaction?.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cashier</p>
                    <p className="font-medium">
                      {transaction?.cashier?.name || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <div className="font-medium flex flex-wrap gap-2 items-center">
                      {transaction?.member ? (
                        <>
                          {transaction.member.name}
                          {transaction.member.tier && (
                            <Badge variant="outline">
                              {transaction.member.tier}
                            </Badge>
                          )}
                        </>
                      ) : (
                        'Guest'
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Method
                    </p>
                    <p className="font-medium capitalize">
                      {transaction?.payment?.method?.replace(/[_-]/g, ' ') ||
                        'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Items List */}
              <div>
                <h3 className="font-semibold mb-3">
                  Items Purchased ({transaction?.items?.length || 0})
                </h3>

                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-[300px] overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 sticky top-0 bg-muted z-10">
                            Product
                          </th>
                          <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                            Price
                          </th>
                          <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                            Quantity
                          </th>
                          <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(transaction?.items || []).map(
                          (item: TransactionDetailItem, index: number) => (
                            <tr
                              key={item?.id || index}
                              className="border-t hover:bg-muted/50 transition-colors"
                            >
                              <td className="p-3">
                                <div className="break-words max-w-[200px] sm:max-w-[300px]">
                                  <p className="font-medium">
                                    {item?.product?.name || 'Unknown Product'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item?.product?.unit ||
                                      item?.product?.category ||
                                      ''}
                                  </p>
                                  {item?.discountApplied && (
                                    <div className="mt-1">
                                      <Badge
                                        variant="outline"
                                        className="text-xs text-rose-600"
                                      >
                                        {item.discountApplied.name}: -
                                        {formatRupiah(
                                          item.discountApplied.amount,
                                        )}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="text-right p-3 whitespace-nowrap">
                                {formatRupiah(
                                  item?.product?.price ||
                                    item?.pricePerUnit ||
                                    0,
                                )}
                              </td>
                              <td className="text-right p-3 whitespace-nowrap">
                                {item?.quantity || 0}
                              </td>
                              <td className="text-right p-3 whitespace-nowrap font-medium">
                                {formatRupiah(
                                  item?.originalAmount ||
                                    item?.subtotal ||
                                    (item?.product?.price ||
                                      item?.pricePerUnit ||
                                      0) * (item?.quantity || 0),
                                )}
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
              </div>

              <Separator />

              {/* Pricing Summary */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {formatRupiah(transaction?.pricing?.originalAmount || 0)}
                  </span>
                </div>

                {transaction?.pricing?.discounts?.member && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Member Discount
                    </span>
                    <span className="text-rose-600">
                      -
                      {formatRupiah(
                        transaction.pricing.discounts.member.amount,
                      )}
                    </span>
                  </div>
                )}

                {transaction?.pricing?.discounts?.products > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Product Discounts
                    </span>
                    <span className="text-rose-600">
                      -{formatRupiah(transaction.pricing.discounts.products)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Discount</span>
                  <span className="text-rose-600">
                    -{formatRupiah(transaction?.pricing?.discounts?.total || 0)}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {formatRupiah(transaction?.pricing?.finalAmount || 0)}
                  </span>
                </div>

                {/* Payment Information */}
                {transaction?.payment && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg space-y-2">
                    <h4 className="font-medium">Payment Details</h4>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Payment Method
                      </span>
                      <span className="capitalize font-medium">
                        {(transaction?.payment?.method || '')
                          .replace(/[_-]/g, ' ')
                          .toLowerCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="font-medium">
                        {formatRupiah(
                          transaction?.payment?.amount ||
                            transaction?.payment?.cashAmount ||
                            transaction?.pricing?.finalAmount ||
                            0,
                        )}
                      </span>
                    </div>

                    {(transaction?.payment?.method === 'CASH' ||
                      (transaction?.payment?.change !== null &&
                        transaction?.payment?.change > 0)) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Change</span>
                        <span className="font-medium">
                          {formatRupiah(transaction?.payment?.change || 0)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Points Earned */}
              {transaction?.pointsEarned > 0 && (
                <Card className="bg-primary/5 border-primary/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M12 2v4" />
                        <path d="m16.2 7.8 2.9-2.9" />
                        <path d="M18 12h4" />
                        <path d="m16.2 16.2 2.9 2.9" />
                        <path d="M12 18v4" />
                        <path d="m4.9 19.1 2.9-2.9" />
                        <path d="M2 12h4" />
                        <path d="m4.9 4.9 2.9 2.9" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Points Earned</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.pointsEarned} points have been added to the
                        member's account
                      </p>
                    </div>
                  </div>
                </Card>
              )}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!loading && transaction && (
            <Button onClick={handlePdfGeneration} disabled={pdfLoading}>
              <IconDownload className="h-4 w-4 mr-2" />
              {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
