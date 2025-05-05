'use client';

import { useState, useEffect } from 'react';
import { getBatchSummary } from '../action';
import { BatchTable } from './batch-table';
import { ProductBatchWithProduct } from '@/lib/types/product-batch';
import { UnitWithCounts } from '@/lib/types/unit';
import BatchPrimaryButton from './batch-primary-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  IconCalendarExclamation,
  IconBox,
  IconPackage,
  IconPackageOff,
  IconAlertTriangle,
  IconCalendarTime,
} from '@tabler/icons-react';
import { useToast } from '@/hooks/use-toast';
export default function MainContent() {
  const { toast } = useToast();
  const [expiringBatches, setExpiringBatches] = useState<
    ProductBatchWithProduct[]
  >([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [batchStats, setBatchStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    expired: 0,
    expiringSoon: 0,
    isLoading: true,
  });
  const simpleLoading = () => {
    return (
      <div className="flex items-center space-x-1 py-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-muted-foreground text-xs animate-pulse">
          {' '}
          Calculating..
        </span>
      </div>
    );
  };
  const fetchbatchSummary = async () => {
    setBatchStats((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await getBatchSummary();
      if (response.success) {
        const data = response.data;
        setBatchStats({
          total: data?.total || 0,
          inStock: data?.inStock || 0,
          outOfStock: data?.outOfStock || 0,
          expired: data?.expired || 0,
          expiringSoon: data?.expiringSoon || 0,
          isLoading: false,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch batch summary',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch batch summary',
        variant: 'destructive',
      });
    }
  };
  const handleOpenForm = (state: boolean) => {
    setDialogOpen(state);
  };
  useEffect(() => {
    fetchbatchSummary();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Manage Product Batches
          </h2>
          <p className="text-muted-foreground">
            Track and manage your inventory batches, expiration dates, and stock
            levels.
          </p>
        </div>
        <BatchPrimaryButton
          open={dialogOpen}
          onOpenChange={(state) => {
            handleOpenForm(state ? true : false);
          }}
          onSuccess={() => {}}
        />
      </div>

      {/* Stats cards to match dashboard style */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-b-2 pb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <IconPackage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {batchStats.isLoading ? simpleLoading() : batchStats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              All product batches in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <IconBox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {batchStats.isLoading ? simpleLoading() : batchStats.inStock}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((batchStats.inStock / batchStats.total) * 100) || 0}%
              of total batches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <IconPackageOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">
              {batchStats.isLoading ? simpleLoading() : batchStats.outOfStock}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((batchStats.outOfStock / batchStats.total) * 100) ||
                0}
              % of total batches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {batchStats.isLoading ? simpleLoading() : batchStats.expired}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((batchStats.expired / batchStats.total) * 100) || 0}%
              of total batches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <IconCalendarTime className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {batchStats.isLoading ? simpleLoading() : batchStats.expiringSoon}
            </div>
            <p className="text-xs text-muted-foreground">
              Within the next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warning for expiring batches */}
      {expiringBatches.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <IconCalendarExclamation
                size={24}
                className="text-yellow-600 dark:text-yellow-500"
              />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-500">
                  {expiringBatches.length}{' '}
                  {expiringBatches.length === 1 ? 'batch is' : 'batches are'}{' '}
                  expiring soon!
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Please check the expiring batches and plan accordingly to
                  minimize waste.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Main batch table */}
      <BatchTable />
    </div>
  );
}
