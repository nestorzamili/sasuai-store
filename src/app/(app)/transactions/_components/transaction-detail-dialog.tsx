'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { getTransactionById } from '../action';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconDownload, IconReceipt } from '@tabler/icons-react';
import { pdf } from '@react-pdf/renderer';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TransactionDetails } from '@/lib/services/transaction/types';

import { TransactionDetailOverview } from './transaction-details/transaction-detail-overview';
import { TransactionDetailItems } from './transaction-details/transaction-detail-items';
import { TransactionPDF } from './transaction-generate-pdf';

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

  const handlePdfGeneration = async () => {
    if (!transaction) return;

    try {
      setPdfLoading(true);

      // Generate PDF using react-pdf
      const pdfDoc = pdf(<TransactionPDF transaction={transaction} />);
      const blob = await pdfDoc.toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${transaction.tranId}.pdf`;
      link.click();

      // Cleanup
      URL.revokeObjectURL(url);

      setPdfLoading(false);
      toast({
        title: t('success'),
        description: t('pdfDownloaded'),
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: t('error'),
        description: t('failedToGenerate'),
        variant: 'destructive',
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const fetchTransactionDetails = async () => {
    if (!open || !transactionId) return;

    try {
      setLoading(true);
      const result = await getTransactionById(transactionId);

      if (result.success && result.data) {
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
  };

  useEffect(() => {
    fetchTransactionDetails();
  }, [open, transactionId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-hidden p-0">
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className="sr-only">
          {t('title')}: {transaction?.tranId || ''}
        </DialogTitle>

        {loading ? (
          <div className="p-6 pt-8">
            <TransactionDetailSkeleton />
          </div>
        ) : transaction ? (
          <div className="flex h-[70vh] pt-4">
            {/* Left Side - Transaction Information */}
            <div className="w-1/2 border-r flex flex-col">
              {/* Fixed Header */}
              <div className="px-6 py-4 border-b bg-background">
                <h3 className="text-lg font-semibold">
                  {t('transactionInformation')}
                </h3>
              </div>
              {/* Scrollable Content */}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <TransactionDetailOverview transaction={transaction} />
                </div>
              </ScrollArea>
            </div>

            {/* Right Side - Transaction Items */}
            <div className="w-1/2 flex flex-col">
              {/* Fixed Header */}
              <div className="px-6 py-4 border-b bg-background">
                <h3 className="text-lg font-semibold">
                  {t('purchasedItems')} ({transaction.items?.length || 0})
                </h3>
              </div>
              {/* Scrollable Content */}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <TransactionDetailItems transaction={transaction} />
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <IconReceipt className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">{t('notFound')}</p>
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t">
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

function TransactionDetailSkeleton() {
  return (
    <div className="flex h-[70vh]">
      {/* Left Skeleton */}
      <div className="w-1/2 border-r flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b bg-background">
          <Skeleton className="h-6 w-48" />
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>

      {/* Right Skeleton */}
      <div className="w-1/2 flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b bg-background">
          <Skeleton className="h-6 w-40" />
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 p-6">
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
