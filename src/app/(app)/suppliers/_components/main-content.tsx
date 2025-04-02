'use client';

import { useState, useEffect } from 'react';
import { getAllSuppliersWithCount } from '../action';
import SupplierPrimaryButton from './supplier-primary-button';
import { SupplierTable } from './supplier-table';
import { SupplierWithCount } from '@/lib/types/supplier';

export default function MainContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<SupplierWithCount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierWithCount | null>(null);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const { data, success } = await getAllSuppliersWithCount();
      if (success) {
        // Cast the data to the correct type
        const supplierData = (data as SupplierWithCount[]) || [];
        setSuppliers(supplierData);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Manage Suppliers
          </h2>
          <p className="text-muted-foreground">
            Manage your product suppliers.
          </p>
        </div>
        <SupplierPrimaryButton
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          initialData={selectedSupplier || undefined}
          onSuccess={handleSuccess}
        />
      </div>

      <SupplierTable
        data={suppliers}
        isLoading={isLoading}
        onEdit={handleEdit}
        onRefresh={fetchSuppliers}
      />
    </div>
  );
}
