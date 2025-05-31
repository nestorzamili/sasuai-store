'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { SupplierTable } from './_components/supplier-table';
import SupplierFormDialog from './_components/supplier-form-dialog';
import {
  SupplierWithCount,
  SupplierFormInitialData,
} from '@/lib/types/supplier';

export default function SuppliersPage() {
  const t = useTranslations('supplier');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState<
    SupplierFormInitialData | undefined
  >(undefined);

  const handleEdit = useCallback((supplier: SupplierWithCount) => {
    setFormInitialData({
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contact,
    });
    setFormDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setFormDialogOpen(open);
    if (!open) {
      setFormInitialData(undefined);
    }
  }, []);

  const handleSuccess = useCallback(() => {
    setFormDialogOpen(false);
    setFormInitialData(undefined);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <SupplierFormDialog trigger />
      </div>

      <SupplierTable onEdit={handleEdit} onRefresh={handleSuccess} />

      <SupplierFormDialog
        open={formDialogOpen}
        onOpenChange={handleDialogOpenChange}
        initialData={formInitialData}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
