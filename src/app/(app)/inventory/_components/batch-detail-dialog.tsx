'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatRupiah } from '@/lib/currency';
import { getBatchById } from '../action';
import { getBatchStockMovementHistory } from '../stock-actions';
import { ProductBatchWithDetails, StockMovement } from '@/lib/types/inventory';

interface BatchDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
}

export function BatchDetailDialog({
  open,
  onOpenChange,
  batchId,
}: BatchDetailDialogProps) {
  const t = useTranslations('inventory.batchDetailDialog');
  const [batch, setBatch] = useState<ProductBatchWithDetails | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBatchDetails = useCallback(async () => {
    if (!batchId) return;

    setIsLoading(true);
    try {
      const [batchResult, movementsResult] = await Promise.all([
        getBatchById(batchId),
        getBatchStockMovementHistory(batchId),
      ]);

      if (batchResult.success && batchResult.data) {
        setBatch(batchResult.data);
      }

      if (movementsResult.success && movementsResult.data) {
        setStockMovements(movementsResult.data);
      }
    } catch (error) {
      console.error('Error fetching batch details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    if (open && batchId) {
      fetchBatchDetails();
    }
  }, [open, batchId, fetchBatchDetails]);

  const isExpired = (expiryDate: Date): boolean => {
    return new Date(expiryDate) < new Date();
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('loading')}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">{t('loadingMessage')}</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!batch) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('notFound')}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <span>{t('notFoundMessage')}</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const expired = isExpired(batch.expiryDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('basicInfo')}</span>
                {expired && <Badge variant="destructive">{t('expired')}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('productName')}
                  </div>
                  <div className="font-medium">{batch.product.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('batchCode')}
                  </div>
                  <div className="font-medium">{batch.batchCode}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('category')}
                  </div>
                  <div className="font-medium">
                    {batch.product.category?.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('unit')}
                  </div>
                  <div className="font-medium">{batch.product.unit?.name}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantity & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>{t('quantityPricing')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('initialQuantity')}
                  </div>
                  <div className="font-medium">
                    {batch.initialQuantity.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('remainingQuantity')}
                  </div>
                  <div className="font-medium">
                    {batch.remainingQuantity.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('buyPrice')}
                  </div>
                  <div className="font-medium">
                    {formatRupiah(batch.buyPrice)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('expiryDate')}
                  </div>
                  <div
                    className={`font-medium ${expired ? 'text-destructive' : ''}`}
                  >
                    {format(new Date(batch.expiryDate), 'PPP')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Movement History */}
          {stockMovements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('stockMovementHistory')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stockMovements.map((movement) => (
                    <div
                      key={movement.id}
                      className={`flex justify-between items-center p-2 rounded ${
                        movement.type === 'IN' ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <div>
                        <div
                          className={`font-medium ${
                            movement.type === 'IN'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {movement.type === 'IN' ? '+' : '-'}
                          {movement.quantity} {movement.unit.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(movement.date), 'PPp')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {movement.type === 'IN' && movement.supplier && (
                          <Badge variant="outline">
                            {movement.supplier.name}
                          </Badge>
                        )}
                        {movement.type === 'OUT' && movement.reason && (
                          <Badge variant="outline">{movement.reason}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Legacy Stock Movement Display - Keep for compatibility */}
          {batch &&
            (batch.stockIns.length > 0 || batch.stockOuts.length > 0) &&
            stockMovements.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('stockMovementHistoryLegacy')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Stock Ins */}
                    {batch.stockIns.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">
                          {t('stockInRecords')}
                        </h4>
                        <div className="space-y-2">
                          {batch.stockIns.map((stockIn) => (
                            <div
                              key={stockIn.id}
                              className="flex justify-between items-center p-2 bg-green-50 rounded"
                            >
                              <div>
                                <div className="font-medium">
                                  +{stockIn.quantity} {stockIn.unit.symbol}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(stockIn.date), 'PPp')}
                                </div>
                              </div>
                              {stockIn.supplier && (
                                <Badge variant="outline">
                                  {stockIn.supplier.name}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stock Outs */}
                    {batch.stockOuts.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">
                          {t('stockOutRecords')}
                        </h4>
                        <div className="space-y-2">
                          {batch.stockOuts.map((stockOut) => (
                            <div
                              key={stockOut.id}
                              className="flex justify-between items-center p-2 bg-red-50 rounded"
                            >
                              <div>
                                <div className="font-medium">
                                  -{stockOut.quantity} {stockOut.unit.symbol}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(stockOut.date), 'PPp')}
                                </div>
                              </div>
                              <Badge variant="outline">{stockOut.reason}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Transaction History */}
          {batch.transactionItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('transactionHistory')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {batch.transactionItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-2 bg-blue-50 rounded"
                    >
                      <div>
                        <div className="font-medium">
                          {t('sold')}: {item.quantity} {item.unit.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('transactionId')}: {item.transaction.id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(item.transaction.createdAt), 'PPp')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatRupiah(item.unitPrice)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('perUnit')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
