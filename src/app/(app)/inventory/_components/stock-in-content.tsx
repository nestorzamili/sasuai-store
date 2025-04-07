'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  IconRefresh,
  IconClipboardList,
  IconSum,
  IconTruck,
} from '@tabler/icons-react';
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

  // Calculate stats
  const stats = {
    total: stockIns.length,
    totalQuantity: stockIns.reduce((sum, record) => sum + record.quantity, 0),
    withSupplier: stockIns.filter((record) => record.supplierId).length,
    noSupplier: stockIns.filter((record) => !record.supplierId).length,
  };

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

      {/* Updated Stats cards to match dashboard style */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <IconClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Stock addition records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Quantity
            </CardTitle>
            <IconSum className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalQuantity}
            </div>
            <p className="text-xs text-muted-foreground">
              Units added to inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Supplier</CardTitle>
            <IconTruck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withSupplier}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.withSupplier / stats.total) * 100) || 0}% from
              suppliers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stock In Table */}
      <StockInTable
        data={stockIns}
        isLoading={isLoading}
        onRefresh={fetchStockIns}
        suppliers={suppliers}
      />
    </div>
  );
}
