'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { IconRefresh } from '@tabler/icons-react';
import { StockOutComplete } from '@/lib/types/stock-movement';
import { useToast } from '@/hooks/use-toast';
import { getAllStockOuts } from '../stock-actions';
import { StockOutTable } from './stock-out-table';

export default function StockOutContent() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stockOuts, setStockOuts] = useState<StockOutComplete[]>([]);

  // Function to fetch all stock out records
  const fetchStockOuts = async () => {
    setIsLoading(true);
    try {
      const { data, success } = await getAllStockOuts();
      if (success && data) {
        // Transform the data to match StockOutComplete structure
        const transformedData = data.map((item: any) => ({
          ...item,
          batch: {
            id: item.batch.id,
            batchCode: item.batch.batchCode,
            product: {
              id: item.batch.productId,
              name: item.batch.product?.name || 'Unknown Product',
            },
          },
        }));
        setStockOuts(transformedData);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch stock out records',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchStockOuts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Stock Out Records</h2>
          <p className="text-muted-foreground">
            View all stock removals from your inventory
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchStockOuts}
          className="flex items-center gap-1"
        >
          <IconRefresh size={16} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Stock Out Table */}
      <StockOutTable
        data={stockOuts}
        isLoading={isLoading}
        onRefresh={fetchStockOuts}
      />
    </div>
  );
}
