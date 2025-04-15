'use client';

import { useState } from 'react';
import { SupplierTable } from './_components/supplier-table';
import { SupplierFormInitialData } from '@/lib/types/supplier';
import SupplierFormDialog from './_components/supplier-form-dialog';

export default function SuppliersPage() {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState<
    SupplierFormInitialData | undefined
  >(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (supplier: any) => {
    setFormInitialData({
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contact || '',
    });
    setFormDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setFormDialogOpen(open);
    if (!open) {
      setFormInitialData(undefined);
    }
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <SupplierFormDialog
          open={formDialogOpen}
          onOpenChange={handleDialogOpenChange}
          initialData={formInitialData}
          onSuccess={handleSuccess}
          trigger
        />
      </div>
      <SupplierTable
        onEdit={handleEdit}
        onRefresh={handleSuccess}
        key={`supplier-table-${refreshTrigger}`}
      />
    </div>
  );
}
