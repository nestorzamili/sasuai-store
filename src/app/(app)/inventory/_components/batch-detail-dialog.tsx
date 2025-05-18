'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { getBatchById } from '../action';
import { ProductBatchWithDetails } from '@/lib/types/product-batch';
import {
  IconCalendar,
  IconInfoCircle,
  IconBox,
  IconCoin,
  IconArrowUp,
  IconArrowDown,
} from '@tabler/icons-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getBatchStockMovementHistory } from '../stock-actions';
import { StockMovement } from '@/lib/types/product-batch';

interface BatchDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string | null;
}

export function BatchDetailDialog({
  open,
  onOpenChange,
  batchId,
}: BatchDetailDialogProps) {
  const [batch, setBatch] = useState<ProductBatchWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch batch details when the dialog opens
  useEffect(() => {
    const fetchBatch = async () => {
      if (!batchId || !open) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getBatchById(batchId);
        if (response.success && response.data) {
          // Validate response data has the required structure
          if (!validateBatchData(response.data)) {
            setError('Invalid batch data received from server');
            setIsLoading(false);
            return;
          }

          // Safe to set as ProductBatchWithDetails now
          setBatch(response.data as ProductBatchWithDetails);

          // Fetch stock movements separately
          fetchStockMovements(batchId);
        } else {
          setError(response.error || 'Failed to fetch batch details');
        }
      } catch (error) {
        console.error('Failed to fetch batch details', error);
        setError('An unexpected error occurred while fetching batch details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatch();
  }, [batchId, open]);

  // Helper function to validate the batch data structure
  const validateBatchData = (data: any): data is ProductBatchWithDetails => {
    return (
      data &&
      typeof data === 'object' &&
      'id' in data &&
      'product' in data &&
      data.product &&
      typeof data.product === 'object' &&
      'stockIns' in data &&
      Array.isArray(data.stockIns) &&
      'stockOuts' in data &&
      Array.isArray(data.stockOuts) &&
      'transactionItems' in data &&
      Array.isArray(data.transactionItems)
    );
  };

  const fetchStockMovements = async (id: string) => {
    setIsLoadingMovements(true);
    try {
      const response = await getBatchStockMovementHistory(id);
      if (response.success) {
        // Map the response data to include the required batchId property
        const mappedMovements = response.data
          ? response.data.map((item) => ({
              ...item,
              batchId: id,
            }))
          : [];
        // Fix: Use type assertion with unknown as intermediate step
        setMovements(mappedMovements as unknown as StockMovement[]);
      } else {
        console.error('Error fetching stock movements:', response.error);
      }
    } catch (error) {
      console.error('Failed to fetch stock movements', error);
    } finally {
      setIsLoadingMovements(false);
    }
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      // Reset with a slight delay to prevent UI flicker
      const timer = setTimeout(() => {
        setBatch(null);
        setMovements([]);
        setError(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Determine if batch is expired
  const isExpired = batch ? new Date(batch.expiryDate) < new Date() : false;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'PPP');
  };

  // Filter movements by type
  const stockInMovements = movements.filter((move) => move.type === 'IN');
  const stockOutMovements = movements.filter((move) => move.type === 'OUT');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isLoading
              ? 'Loading batch details...'
              : batch
              ? `Batch: ${batch.batchCode}`
              : 'Batch Details'}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <BatchDetailSkeleton />
        ) : error ? (
          <div className="py-6 text-center text-destructive">
            <IconInfoCircle className="h-12 w-12 mx-auto" />
            <p className="mt-2 font-medium">{error}</p>
            <p className="mt-1 text-muted-foreground">Please try again later</p>
          </div>
        ) : batch ? (
          <Tabs
            defaultValue="details"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="details">Batch Details</TabsTrigger>
              <TabsTrigger value="movements">Stock Movements</TabsTrigger>
              <TabsTrigger value="stockIn">Stock In History</TabsTrigger>
              <TabsTrigger value="stockOut">Stock Out History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">
                    Product
                  </h3>
                  <p className="font-medium">{batch.product.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">
                    SKU Code
                  </h3>
                  <p className="font-medium">
                    {batch.product.skuCode || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">
                    Category
                  </h3>
                  <p className="font-medium">
                    {batch.product.category?.name || 'Uncategorized'}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <h3 className="font-medium text-muted-foreground mb-2">
                    Expiry Date
                  </h3>
                  <div className="flex items-center">
                    <IconCalendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    <span
                      className={
                        isExpired
                          ? 'text-destructive font-medium'
                          : 'font-medium'
                      }
                    >
                      {formatDate(batch.expiryDate)}
                    </span>
                    {isExpired && (
                      <Badge variant="destructive" className="ml-2">
                        Expired
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-medium text-muted-foreground mb-2">
                    Stock Status
                  </h3>
                  <div className="flex items-center">
                    <IconBox className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    <span className="font-medium">
                      {batch.remainingQuantity} of {batch.initialQuantity}
                    </span>
                    <Badge
                      className="ml-2"
                      variant={
                        batch.remainingQuantity > 0 ? 'default' : 'secondary'
                      }
                    >
                      {batch.remainingQuantity > 0
                        ? 'In Stock'
                        : 'Out of Stock'}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-medium text-muted-foreground mb-2">
                    Buy Price
                  </h3>
                  <div className="flex items-center">
                    <IconCoin className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    <span className="font-medium">
                      {formatCurrency(batch.buyPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">
                    Additional Information
                  </h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          Batch Code
                        </TableCell>
                        <TableCell>{batch.batchCode}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Date Added
                        </TableCell>
                        <TableCell>{formatDate(batch.createdAt)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Unit</TableCell>
                        <TableCell>
                          {batch.product.unit
                            ? `${batch.product.unit.name} (${batch.product.unit.symbol})`
                            : 'Unknown Unit'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Supplier</TableCell>
                        <TableCell>
                          {batch.stockIns &&
                          batch.stockIns.length > 0 &&
                          batch.stockIns[0]?.supplier
                            ? batch.stockIns[0].supplier.name
                            : 'No supplier recorded'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Usage Rate
                        </TableCell>
                        <TableCell>
                          {batch.initialQuantity > 0
                            ? `${Math.round(
                                ((batch.initialQuantity -
                                  batch.remainingQuantity) /
                                  batch.initialQuantity) *
                                  100
                              )}% used`
                            : '0% used'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="movements" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Stock Movements</h3>
                  {isLoadingMovements ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : movements.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movements.map((movement) => (
                          <TableRow key={movement.id}>
                            <TableCell>{formatDate(movement.date)}</TableCell>
                            <TableCell>
                              {movement.type === 'IN' ? (
                                <Badge className="bg-green-500">
                                  <IconArrowUp className="h-3 w-3 mr-1" />
                                  IN
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <IconArrowDown className="h-3 w-3 mr-1" />
                                  OUT
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{movement.quantity}</TableCell>
                            <TableCell>
                              {movement.unit?.symbol || '-'}
                            </TableCell>
                            <TableCell>
                              {movement.type === 'IN'
                                ? movement.supplier
                                  ? `From: ${movement.supplier.name}`
                                  : 'Manual adjustment'
                                : movement.reason || 'No reason provided'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="py-8 text-center">
                      <IconInfoCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">
                        No stock movements found
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stockIn" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Stock In History</h3>
                  {isLoadingMovements ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : stockInMovements.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Supplier</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockInMovements.map((movement) => (
                          <TableRow key={movement.id}>
                            <TableCell>{formatDate(movement.date)}</TableCell>
                            <TableCell>{movement.quantity}</TableCell>
                            <TableCell>
                              {movement.unit ? movement.unit.symbol : '-'}
                            </TableCell>
                            <TableCell>
                              {movement.supplier
                                ? movement.supplier.name
                                : 'No supplier'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="py-8 text-center">
                      <IconInfoCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">
                        No stock in records available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stockOut" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">
                    Stock Out History
                  </h3>
                  {isLoadingMovements ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : stockOutMovements.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockOutMovements.map((movement) => (
                          <TableRow key={movement.id}>
                            <TableCell>{formatDate(movement.date)}</TableCell>
                            <TableCell>{movement.quantity}</TableCell>
                            <TableCell>
                              {movement.unit ? movement.unit.symbol : '-'}
                            </TableCell>
                            <TableCell>{movement.reason || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="py-8 text-center">
                      <IconInfoCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">
                        No stock out records available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-6 text-center">
            <IconInfoCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              No batch information available
            </p>
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BatchDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-7 w-48 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-5 w-[120px]" />
                <Skeleton className="h-5 w-[200px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
