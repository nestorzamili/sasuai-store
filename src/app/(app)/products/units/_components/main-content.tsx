'use client';

import { useState, useEffect } from 'react';
import { getAllUnitsWithCounts } from '../action';
import UnitPrimaryButton from './unit-primary-button';
import { UnitTable } from './unit-table';
import { UnitWithCounts } from '@/lib/types/unit';

export default function MainContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [units, setUnits] = useState<UnitWithCounts[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithCounts | null>(null);

  const fetchUnits = async () => {
    setIsLoading(true);
    try {
      const { data, success } = await getAllUnitsWithCounts();
      if (success) {
        const unitData = (data as UnitWithCounts[]) || [];
        setUnits(unitData);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // Handle edit unit
  const handleEdit = (unit: UnitWithCounts) => {
    setSelectedUnit(unit);
    setIsDialogOpen(true);
  };

  // Handle unit operation success
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedUnit(null);
    fetchUnits();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Units</h2>
          <p className="text-muted-foreground">
            Manage your measurement units for products and inventory.
          </p>
        </div>
        <UnitPrimaryButton
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          initialData={selectedUnit || undefined}
          onSuccess={handleSuccess}
        />
      </div>

      <UnitTable
        data={units}
        isLoading={isLoading}
        onEdit={handleEdit}
        onRefresh={fetchUnits}
      />
    </div>
  );
}
