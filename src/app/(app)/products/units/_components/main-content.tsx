'use client';

import { useState, useEffect } from 'react';
import { getAllUnitsWithCounts } from '../action';
import { getAllConversions } from '../conversion-actions';
import UnitPrimaryButton from './unit-primary-button';
import { UnitTable } from './unit-table';
import { UnitWithCounts, UnitConversionWithUnits } from '@/lib/types/unit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnitConversionTable } from './unit-conversion-table';
import ConversionPrimaryButton from './conversion-primary-button';
import UnitConversionCalculator from './unit-conversion-calculator';
import { toast } from '@/hooks/use-toast';

export default function MainContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingConversions, setIsLoadingConversions] = useState(true);
  const [units, setUnits] = useState<UnitWithCounts[]>([]);
  const [conversions, setConversions] = useState<UnitConversionWithUnits[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConversionDialogOpen, setIsConversionDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithCounts | null>(null);
  const [selectedConversion, setSelectedConversion] =
    useState<UnitConversionWithUnits | null>(null);
  const [activeTab, setActiveTab] = useState('units');

  const fetchUnits = async () => {
    setIsLoading(true);
    try {
      const { data, success } = await getAllUnitsWithCounts();
      if (success) {
        const unitData = (data as UnitWithCounts[]) || [];
        setUnits(unitData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch units. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversions = async () => {
    setIsLoadingConversions(true);
    try {
      const { data, success } = await getAllConversions();
      if (success) {
        const conversionData = (data as UnitConversionWithUnits[]) || [];
        setConversions(conversionData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch conversions. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingConversions(false);
    }
  };

  useEffect(() => {
    fetchUnits();
    fetchConversions();
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
    if (value === 'conversions' && conversions.length === 0) {
      fetchConversions();
    }
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
    fetchUnits();
  };

  // Handle conversion operation success
  const handleConversionSuccess = () => {
    setIsConversionDialogOpen(false);
    setSelectedConversion(null);
    fetchConversions();
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
        <TabsContent value="units" className="mt-6">
          <UnitTable
            data={units}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefresh={fetchUnits}
          />
        </TabsContent>
        <TabsContent value="conversions" className="mt-6">
          <UnitConversionTable
            data={conversions}
            isLoading={isLoadingConversions}
            units={units}
            onEdit={handleEditConversion}
            onRefresh={fetchConversions}
          />
        </TabsContent>
        <TabsContent value="calculator" className="mt-6">
          <UnitConversionCalculator units={units} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
