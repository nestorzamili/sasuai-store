'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { IconRefresh } from '@tabler/icons-react';
import { StockInComplete } from '@/lib/types/stock-movement';
import { useToast } from '@/hooks/use-toast';
import { getAllStockIns } from '../stock-actions';
import { StockInTable } from './stock-in-table';
import { getAllSuppliers } from '@/app/(app)/suppliers/action';
import { SupplierWithCount } from '@/lib/types/supplier';

export default function StockInContent() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stockIns, setStockIns] = useState<StockInComplete[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierWithCount[]>([]);

  // Function to fetch all stock in records
  const fetchStockIns = async () => {
    setIsLoading(true);
    try {
      const { data, success } = await getAllStockIns();
      if (success) {
        setStockIns(data as StockInComplete[]);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch stock in records',
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

  const fetchSuppliers = async () => {
    try {
      const { data, success } = await getAllSuppliers();
      if (success) {
        setSuppliers(data as SupplierWithCount[]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch suppliers',
        variant: 'destructive',
      });
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    Promise.all([fetchStockIns(), fetchSuppliers()]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Stock In Records</h2>
          <p className="text-muted-foreground">
            View all stock additions to your inventory
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchStockIns}
          className="flex items-center gap-1"
        >
          <IconRefresh size={16} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Stock In Table */}
      <StockInTable />
    </div>
  );
}
