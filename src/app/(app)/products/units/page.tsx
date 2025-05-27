'use client';

import { useState, useEffect } from 'react';
import { getAllUnits } from './action';
import UnitPrimaryButton from './_components/unit-primary-button';
import { UnitTable } from './_components/unit-table';
import { UnitWithCounts, UnitConversionWithUnits } from '@/lib/types/unit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnitConversionTable } from './_components/unit-conversion-table';
import ConversionPrimaryButton from './_components/conversion-primary-button';
import UnitConversionCalculator from './_components/unit-conversion-calculator';
import { toast } from '@/hooks/use-toast';

export default function UnitsPage() {
  const [units, setUnits] = useState<UnitWithCounts[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConversionDialogOpen, setIsConversionDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithCounts | null>(null);
  const [selectedConversion, setSelectedConversion] =
    useState<UnitConversionWithUnits | null>(null);
  const [activeTab, setActiveTab] = useState('units');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchUnits = async () => {
    try {
      const result = await getAllUnits();
      if (result.success && result.data) {
        const unitData = result.data.units || [];
        setUnits(unitData);
      }
    } catch (error) {
      console.error('Failed to fetch units:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch units. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // Handle dialog reset on close
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedUnit(null);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle edit unit
  const handleEdit = (unit: UnitWithCounts) => {
    setSelectedUnit(unit);
    setIsDialogOpen(true);
  };

  // Handle edit conversion
  const handleEditConversion = (conversion: UnitConversionWithUnits) => {
    setSelectedConversion(conversion);
    setIsConversionDialogOpen(true);
  };

  // Handle unit operation success
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedUnit(null);
    setRefreshTrigger((prev) => prev + 1);
    fetchUnits();
  };

  // Handle conversion operation success
  const handleConversionSuccess = () => {
    setIsConversionDialogOpen(false);
    setSelectedConversion(null);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Units</h2>
          <p className="text-muted-foreground">
            Manage your measurement units for products and inventory.
          </p>
        </div>
        {activeTab === 'units' ? (
          <UnitPrimaryButton
            open={isDialogOpen}
            onOpenChange={handleDialogOpenChange}
            initialData={selectedUnit || undefined}
            onSuccess={handleSuccess}
          />
        ) : (
          <ConversionPrimaryButton
            open={isConversionDialogOpen}
            onOpenChange={setIsConversionDialogOpen}
            units={units}
            initialData={selectedConversion || undefined}
            onSuccess={handleConversionSuccess}
          />
        )}
      </div>

      <Tabs
        defaultValue="units"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="conversions">Unit Conversions</TabsTrigger>
          <TabsTrigger value="calculator">Conversion Calculator</TabsTrigger>
        </TabsList>
        <TabsContent value="units" className="mt-2">
          <UnitTable
            onEdit={handleEdit}
            onRefresh={handleSuccess}
            key={`unit-table-${refreshTrigger}`}
          />
        </TabsContent>
        <TabsContent value="conversions" className="mt-2">
          <UnitConversionTable
            units={units}
            onEdit={handleEditConversion}
            onRefresh={handleConversionSuccess}
          />
        </TabsContent>
        <TabsContent value="calculator" className="mt-6">
          <UnitConversionCalculator units={units} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
