'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  IconRefresh,
  IconClipboardList,
  IconMinus,
  IconInfoCircle,
} from '@tabler/icons-react';
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
      if (success) {
        setStockOuts(data as StockOutComplete[]);
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

  // Calculate stats
  const totalQuantity = stockOuts.reduce(
    (sum, record) => sum + record.quantity,
    0,
  );

  // Group by reason
  const reasonGroups = stockOuts.reduce((acc, record) => {
    const reason = record.reason || 'Unspecified';
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topReason = Object.entries(reasonGroups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1)[0];

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

      {/* Updated Stats cards to match dashboard style */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <IconClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockOuts.length}</div>
            <p className="text-xs text-muted-foreground">
              Stock removal records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Quantity
            </CardTitle>
            <IconMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {totalQuantity}
            </div>
            <p className="text-xs text-muted-foreground">
              Units removed from inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Reason</CardTitle>
            <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {topReason ? topReason[0] : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {topReason ? `${topReason[1]} occurrences` : 'No data available'}
            </p>
          </CardContent>
        </Card>
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
