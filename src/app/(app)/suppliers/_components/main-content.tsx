'use client';

import { useState, useEffect } from 'react';
import { getAllSuppliersWithCount } from '../action';
import SupplierPrimaryButton from './supplier-primary-button';
import { SupplierTable } from './supplier-table';
import { SupplierWithCount } from '@/lib/types/supplier';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconRefresh, IconFilter } from '@tabler/icons-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function MainContent() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<SupplierWithCount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierWithCount | null>(null);
  const [filterOption, setFilterOption] = useState<string>('all');

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const { data, success } = await getAllSuppliersWithCount();
      if (success) {
        // Cast the data to the correct type
        const supplierData = (data as SupplierWithCount[]) || [];
        setSuppliers(supplierData);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch suppliers',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching suppliers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Handle dialog reset on close
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedSupplier(null);
    }
  };

  // Handle edit supplier
  const handleEdit = (supplier: SupplierWithCount) => {
    setSelectedSupplier(supplier);
    setIsDialogOpen(true);
  };

  // Handle supplier operation success
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedSupplier(null);
    fetchSuppliers();
  };

  // Filter suppliers based on selection
  const filteredSuppliers = suppliers.filter((supplier) => {
    if (filterOption === 'with-stock-ins') {
      return supplier._count.stockIns > 0;
    } else if (filterOption === 'without-stock-ins') {
      return supplier._count.stockIns === 0;
    }
    return true; // 'all' option
  });

  const supplierStats = {
    total: suppliers.length,
    withStockIns: suppliers.filter((s) => s._count.stockIns > 0).length,
    withoutStockIns: suppliers.filter((s) => s._count.stockIns === 0).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Manage Suppliers
          </h2>
          <p className="text-muted-foreground">
            Manage your product suppliers and their stock history.
          </p>
        </div>
        <SupplierPrimaryButton
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          initialData={selectedSupplier || undefined}
          onSuccess={handleSuccess}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Suppliers
                </p>
                <h3 className="text-2xl font-bold">{supplierStats.total}</h3>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {supplierStats.total}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  With Stock-Ins
                </p>
                <h3 className="text-2xl font-bold">
                  {supplierStats.withStockIns}
                </h3>
              </div>
              <Badge className="text-lg px-3 py-1 bg-green-500">
                {supplierStats.withStockIns}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Without Stock-Ins
                </p>
                <h3 className="text-2xl font-bold">
                  {supplierStats.withoutStockIns}
                </h3>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {supplierStats.withoutStockIns}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Select value={filterOption} onValueChange={setFilterOption}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <IconFilter size={16} />
                <SelectValue placeholder="Filter suppliers" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              <SelectItem value="with-stock-ins">With Stock-Ins</SelectItem>
              <SelectItem value="without-stock-ins">
                Without Stock-Ins
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Showing {filteredSuppliers.length} of {suppliers.length} suppliers
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSuppliers}>
          <IconRefresh size={16} className="mr-2" /> Refresh
        </Button>
      </div>

      <SupplierTable
        data={filteredSuppliers}
        isLoading={isLoading}
        onEdit={handleEdit}
        onRefresh={fetchSuppliers}
      />
    </div>
  );
}
