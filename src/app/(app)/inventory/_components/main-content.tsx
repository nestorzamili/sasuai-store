'use client';

import { useState, useEffect } from 'react';
import { getAllBatches } from '../action';
import { getAllProducts } from '@/app/(app)/products/action';
import { getAllUnits } from '@/app/(app)/products/units/action';
import { getAllSuppliers } from '@/app/(app)/suppliers/action';
import BatchPrimaryButton from './batch-primary-button';
import { BatchTable } from './batch-table';
import { BatchAdjustmentDialog } from './batch-adjustment-dialog';
import { ProductBatchWithProduct } from '@/lib/types/product-batch';
import { Product } from '@prisma/client';
import { SupplierWithCount } from '@/lib/types/supplier';
import { UnitWithCounts } from '@/lib/types/unit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  IconRefresh,
  IconFilter,
  IconCalendarExclamation,
  IconBox,
  IconPackage,
  IconPackageOff,
  IconAlertTriangle,
  IconCalendarTime,
} from '@tabler/icons-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getExpiringBatches } from '../action';

export default function MainContent() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [batches, setBatches] = useState<ProductBatchWithProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<UnitWithCounts[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierWithCount[]>([]);
  const [expiringBatches, setExpiringBatches] = useState<
    ProductBatchWithProduct[]
  >([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] =
    useState<ProductBatchWithProduct | null>(null);
  const [filterOption, setFilterOption] = useState<string>('all');

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const { data, success } = await getAllBatches();
      if (success) {
        const batchData = (data as ProductBatchWithProduct[]) || [];
        setBatches(batchData);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch batches',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching batches',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, success } = await getAllProducts();
      if (success) {
        const productData = (data as Product[]) || [];
        setProducts(productData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching products',
        variant: 'destructive',
      });
    }
  };

  const fetchUnits = async () => {
    try {
      const { data, success } = await getAllUnits();
      if (success) {
        const unitData = (data as UnitWithCounts[]) || [];
        setUnits(unitData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching units',
        variant: 'destructive',
      });
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, success } = await getAllSuppliers();
      if (success) {
        const supplierData = (data as SupplierWithCount[]) || [];
        setSuppliers(supplierData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching suppliers',
        variant: 'destructive',
      });
    }
  };

  const fetchExpiringBatches = async () => {
    try {
      const { data, success } = await getExpiringBatches(30); // Get batches expiring in the next 30 days
      if (success) {
        const expiringData = (data as ProductBatchWithProduct[]) || [];
        setExpiringBatches(expiringData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          'An unexpected error occurred while fetching expiring batches',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    Promise.all([
      fetchBatches(),
      fetchProducts(),
      fetchUnits(),
      fetchSuppliers(),
      fetchExpiringBatches(),
    ]);
  }, []);

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedBatch(null);
    }
  };

  // Handle edit batch
  const handleEdit = (batch: ProductBatchWithProduct) => {
    setSelectedBatch(batch);
    setIsDialogOpen(true);
  };

  // Handle adjust quantity
  const handleAdjust = (batch: ProductBatchWithProduct) => {
    setSelectedBatch(batch);
    setIsAdjustmentDialogOpen(true);
  };

  // Handle operation success
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setIsAdjustmentDialogOpen(false);
    setSelectedBatch(null);
    fetchBatches();
    fetchExpiringBatches();
  };

  // Filter batches based on selection
  const getFilteredBatches = () => {
    if (filterOption === 'expired') {
      return batches.filter((batch) => new Date(batch.expiryDate) < new Date());
    } else if (filterOption === 'expiring-soon') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return batches.filter((batch) => {
        const expiryDate = new Date(batch.expiryDate);
        return expiryDate >= new Date() && expiryDate <= thirtyDaysFromNow;
      });
    } else if (filterOption === 'in-stock') {
      return batches.filter((batch) => batch.remainingQuantity > 0);
    } else if (filterOption === 'out-of-stock') {
      return batches.filter((batch) => batch.remainingQuantity === 0);
    }
    return batches; // 'all' option
  };

  const filteredBatches = getFilteredBatches();

  // Calculate stats
  const batchStats = {
    total: batches.length,
    inStock: batches.filter((batch) => batch.remainingQuantity > 0).length,
    outOfStock: batches.filter((batch) => batch.remainingQuantity === 0).length,
    expired: batches.filter((batch) => new Date(batch.expiryDate) < new Date())
      .length,
    expiringSoon: expiringBatches.length,
  };

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
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          initialData={
            selectedBatch
              ? {
                  id: selectedBatch.id,
                  productId: selectedBatch.productId,
                  batchCode: selectedBatch.batchCode,
                  expiryDate: selectedBatch.expiryDate,
                  initialQuantity: selectedBatch.initialQuantity,
                  buyPrice: selectedBatch.buyPrice,
                  unitId: selectedBatch.product.unitId,
                }
              : undefined
          }
          products={products}
          units={units}
          suppliers={suppliers}
          onSuccess={handleSuccess}
        />
      </div>

      {/* Stats cards to match dashboard style */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <IconPackage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batchStats.total}</div>
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
              {batchStats.inStock}
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
              {batchStats.outOfStock}
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
              {batchStats.expired}
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
              {batchStats.expiringSoon}
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

      {/* Filters and search */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Select value={filterOption} onValueChange={setFilterOption}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <IconFilter size={16} />
                <SelectValue placeholder="Filter batches" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="expiring-soon">Expiring Soon (30d)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Showing {filteredBatches.length} of {batches.length} batches
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBatches}>
          <IconRefresh size={16} className="mr-2" /> Refresh
        </Button>
      </div>

      {/* Main batch table */}
      <BatchTable
        data={filteredBatches}
        isLoading={isLoading}
        onEdit={handleEdit}
        onAdjust={handleAdjust}
        onRefresh={fetchBatches}
      />

      {/* Batch adjustment dialog */}
      {selectedBatch && (
        <BatchAdjustmentDialog
          open={isAdjustmentDialogOpen}
          onOpenChange={setIsAdjustmentDialogOpen}
          batch={selectedBatch}
          units={units}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
