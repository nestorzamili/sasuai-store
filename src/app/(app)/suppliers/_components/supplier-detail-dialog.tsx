'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { getSupplierWithStockIns } from '../action';
import { SupplierWithStockIns } from '@/lib/types/supplier';
import { IconCalendar, IconInfoCircle } from '@tabler/icons-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface SupplierDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: string | null;
}

export function SupplierDetailDialog({
  open,
  onOpenChange,
  supplierId,
}: SupplierDetailDialogProps) {
  const t = useTranslations('supplier.detailDialog');
  const [supplier, setSupplier] = useState<SupplierWithStockIns | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch supplier details when the dialog opens - stabilize with useCallback
  const fetchSupplier = useCallback(async () => {
    if (!supplierId || !open) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await getSupplierWithStockIns(supplierId);
      if (response.success) {
        setSupplier(response.data as unknown as SupplierWithStockIns);
      }
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      toast({
        title: t('errorFetching'),
        description: t('unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [supplierId, open, t]);

  useEffect(() => {
    fetchSupplier();
  }, [fetchSupplier]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      // Reset with a slight delay to prevent UI flicker
      const timer = setTimeout(() => {
        setSupplier(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isLoading ? t('loading') : supplier ? supplier.name : t('title')}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <SupplierDetailSkeleton />
        ) : supplier ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-muted-foreground mb-2">
                  {t('contactInformation')}
                </h3>
                <p className="font-medium">
                  {supplier.contact || (
                    <span className="text-muted-foreground italic">
                      {t('noContactInfo')}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground mb-2">
                  {t('totalStockIns')}
                </h3>
                <p className="font-medium">
                  {supplier.stockIns.length} {t('records')}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground mb-2">
                  {t('addedOn')}
                </h3>
                <p className="font-medium flex items-center">
                  <IconCalendar className="h-4 w-4 mr-1" />
                  {format(new Date(supplier.createdAt), 'PPP')}
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">
                  {t('stockInHistory')}
                </h3>
                {supplier.stockIns.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('date')}</TableHead>
                        <TableHead>{t('product')}</TableHead>
                        <TableHead>{t('batch')}</TableHead>
                        <TableHead>{t('quantity')}</TableHead>
                        <TableHead>{t('unit')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplier.stockIns.map((stockIn) => (
                        <TableRow key={stockIn.id}>
                          <TableCell>
                            {format(new Date(stockIn.date), 'PPP')}
                          </TableCell>
                          <TableCell>{stockIn.batch.product.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {stockIn.batch.batchCode}
                            </Badge>
                          </TableCell>
                          <TableCell>{stockIn.quantity}</TableCell>
                          <TableCell>{stockIn.unit.symbol}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center">
                    <IconInfoCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      {t('noStockInRecords')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="py-6 text-center">
            <IconInfoCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">{t('noSupplierInfo')}</p>
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SupplierDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-6 w-56" />
        </div>
        <div>
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div>
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-7 w-48 mb-4" />
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
