'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { getTransactionById } from '../action';
import { formatRupiah } from '@/lib/currency';
import { formatDateTime } from '@/lib/date';
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
import { IconDownload } from '@tabler/icons-react';
import type {
  TransactionDetails,
  TransactionItem,
} from '@/lib/services/transaction/types';

// === LOCAL TYPES ===
interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
}

export function TransactionDetailDialog({
  open,
  onOpenChange,
  transactionId,
}: TransactionDetailDialogProps) {
  const t = useTranslations('transaction.detailDialog');
  const [transaction, setTransaction] = useState<TransactionDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Memoize handlers - stabilize with useCallback
  const handlePdfGeneration = useCallback(async () => {
    if (!transaction) return;

    try {
      setPdfLoading(true);

      // Simple download without PDF generation for now
      // TODO: Implement PDF generation when TransactionPDF component is available
      toast({
        title: t('success'),
        description: 'PDF generation will be implemented soon',
      });

      if (isMounted.current) {
        setPdfLoading(false);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: t('error'),
        description: t('failedToGenerate'),
        variant: 'destructive',
      });
    } finally {
      if (isMounted.current) {
        setPdfLoading(false);
      }
    }
  }, [transaction, t]);

  // Stabilize fetch function with useCallback
  const fetchTransactionDetails = useCallback(async () => {
    if (!open || !transactionId) return;

    try {
      setLoading(true);
      const result = await getTransactionById(transactionId);

      if (result.success && result.data) {
        // Service already returns the correct structure, use directly
        setTransaction(result.data);
      } else {
        toast({
          title: t('error'),
          description: result.error || t('failedToLoad'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in fetchTransactionDetails:', error);
      toast({
        title: t('error'),
        description: t('unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [open, transactionId, t]);

  useEffect(() => {
    fetchTransactionDetails();
  }, [fetchTransactionDetails]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {!loading && transaction
              ? `${t('title')}: ${transaction.tranId}`
              : t('title')}
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
                    <p className="text-sm text-muted-foreground">{t('date')}</p>
                    <p className="font-medium">
                      {formatDateTime(transaction?.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('cashier')}
                    </p>
                    <p className="font-medium">
                      {transaction?.cashier?.name || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('member')}
                    </p>
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
                      {t('paymentMethod')}
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
                  {t('items')} ({transaction?.items?.length || 0})
                </h3>

                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-[300px] overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 sticky top-0 bg-muted z-10">
                            {t('product')}
                          </th>
                          <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                            {t('unitPrice')}
                          </th>
                          <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                            {t('quantity')}
                          </th>
                          <th className="text-right p-3 whitespace-nowrap sticky top-0 bg-muted z-10">
                            {t('subtotal')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(transaction?.items || []).map(
                          (item: TransactionItem, index: number) => (
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
                                {formatRupiah(item?.product?.price || 0)}
                              </td>
                              <td className="text-right p-3 whitespace-nowrap">
                                {item?.quantity || 0}
                              </td>
                              <td className="text-right p-3 whitespace-nowrap font-medium">
                                {formatRupiah(item?.originalAmount || 0)}
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
                              {t('noItems')}
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
                <h4 className="font-medium">{t('summary')}</h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('totalAmount')}
                  </span>
                  <span>
                    {formatRupiah(transaction?.pricing?.originalAmount || 0)}
                  </span>
                </div>

                {transaction?.pricing?.discounts?.member && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t('memberDiscount')}
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
                      {t('productDiscounts')}
                    </span>
                    <span className="text-rose-600">
                      -{formatRupiah(transaction.pricing.discounts.products)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('discountAmount')}
                  </span>
                  <span className="text-rose-600">
                    -{formatRupiah(transaction?.pricing?.discounts?.total || 0)}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>{t('finalAmount')}</span>
                  <span>
                    {formatRupiah(transaction?.pricing?.finalAmount || 0)}
                  </span>
                </div>

                {/* Payment Information */}
                {transaction?.payment && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg space-y-2">
                    <h4 className="font-medium">{t('paymentDetails')}</h4>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('paymentMethod')}
                      </span>
                      <span className="capitalize font-medium">
                        {(transaction?.payment?.method || '')
                          .replace(/[_-]/g, ' ')
                          .toLowerCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('paymentAmount')}
                      </span>
                      <span className="font-medium">
                        {formatRupiah(
                          transaction?.payment?.amount ||
                            transaction?.pricing?.finalAmount ||
                            0,
                        )}
                      </span>
                    </div>

                    {(transaction?.payment?.method === 'CASH' ||
                      (transaction?.payment?.change !== null &&
                        transaction?.payment?.change > 0)) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t('changeAmount')}
                        </span>
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
                      <p className="font-medium">{t('pointsEarned')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('pointsEarnedMessage', {
                          points: transaction.pointsEarned,
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center p-6">
              <h3 className="text-lg font-medium">{t('notFound')}</h3>
              <p className="text-muted-foreground">{t('notFoundMessage')}</p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('close')}
          </Button>
          {!loading && transaction && (
            <Button onClick={handlePdfGeneration} disabled={pdfLoading}>
              <IconDownload className="h-4 w-4 mr-2" />
              {pdfLoading ? t('generatingPdf') : t('downloadPdf')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
