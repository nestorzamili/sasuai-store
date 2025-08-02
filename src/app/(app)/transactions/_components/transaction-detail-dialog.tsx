'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { getTransactionById } from '../action';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconDownload } from '@tabler/icons-react';
import { pdf } from '@react-pdf/renderer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { TransactionDetails } from '@/lib/services/transaction/types';

import { TransactionHeader } from './transaction-header';
import { TransactionItemsTable } from './transaction-items-table';
import { TransactionPricingSummary } from './transaction-pricing-summary';
import { TransactionPointsCard } from './transaction-points-card';
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
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handlePdfGeneration = useCallback(async () => {
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

      if (isMounted.current) {
        setPdfLoading(false);
        toast({
          title: t('success'),
          description: t('pdfDownloaded'),
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (isMounted.current) {
        toast({
          title: t('error'),
          description: t('failedToGenerate'),
          variant: 'destructive',
        });
      }
    } finally {
      if (isMounted.current) {
        setPdfLoading(false);
      }
    }
  }, [transaction, t]);

  const fetchTransactionDetails = useCallback(async () => {
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
              <TransactionHeader transaction={transaction} />

              <Separator />

              <TransactionItemsTable transaction={transaction} />

              <Separator />

              <TransactionPricingSummary transaction={transaction} />

              <TransactionPointsCard
                pointsEarned={transaction.pointsEarned || 0}
              />
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
