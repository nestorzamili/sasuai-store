'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah } from '@/lib/currency';
import { AvailableProductBatch } from '@/lib/types/product-batch';
import { getAvailableBatches } from '../action';

interface ProductSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductSelect: (
    product: AvailableProductBatch & { quantity: number },
  ) => void;
}

export function ProductSelectionDialog({
  open,
  onOpenChange,
  onProductSelect,
}: ProductSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [batches, setBatches] = useState<AvailableProductBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { toast } = useToast();

  // Fetch available product batches
  useEffect(() => {
    async function loadBatches() {
      if (!open) return;

      setLoading(true);
      try {
        const result = await getAvailableBatches(searchQuery);
        if (result.success && result.data) {
          setBatches(result.data as AvailableProductBatch[]);

          // Initialize quantities
          const initialQuantities: Record<string, number> = {};
          result.data.forEach((batch) => {
            initialQuantities[batch.id] = 1; // Default to 1
          });
          setQuantities(initialQuantities);
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to load product batches',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error loading batches:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    loadBatches();
  }, [open, searchQuery, toast]);

  // Handle quantity change
  const handleQuantityChange = (batchId: string, value: number) => {
    if (value <= 0) return;

    const batch = batches.find((b) => b.id === batchId);
    if (batch && value <= batch.availableQuantity) {
      setQuantities((prev) => ({
        ...prev,
        [batchId]: value,
      }));
    } else {
      toast({
        title: 'Quantity limit',
        description: 'Cannot exceed available quantity',
        variant: 'default',
      });
    }
  };

  // Handle product selection
  const handleSelect = (batch: AvailableProductBatch) => {
    const quantity = quantities[batch.id] || 1;

    onProductSelect({
      ...batch,
      quantity,
    });

    onOpenChange(false);
  };

  // Filter products by search query
  const filteredBatches = batches.filter(
    (batch) =>
      batch.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.batchCode.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Product</DialogTitle>
          <DialogDescription>
            Choose a product to add to this transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Products table */}
          <div className="rounded-md border overflow-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Skeleton loading state
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-[180px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[80px] ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[50px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-9 w-[80px]" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredBatches.length > 0 ? (
                  filteredBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">
                        {batch.product.name}
                      </TableCell>
                      <TableCell>{batch.batchCode}</TableCell>
                      <TableCell className="text-right">
                        {formatRupiah(batch.product.price)}
                      </TableCell>
                      <TableCell>
                        {batch.availableQuantity} {batch.unit.symbol}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 w-[120px]">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleQuantityChange(
                                batch.id,
                                (quantities[batch.id] || 1) - 1,
                              )
                            }
                            disabled={quantities[batch.id] <= 1}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">
                            {quantities[batch.id] || 1}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleQuantityChange(
                                batch.id,
                                (quantities[batch.id] || 1) + 1,
                              )
                            }
                            disabled={
                              quantities[batch.id] >= batch.availableQuantity
                            }
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleSelect(batch)}
                          className="w-full space-x-1"
                        >
                          <span>Add</span>
                          <IconPlus size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
