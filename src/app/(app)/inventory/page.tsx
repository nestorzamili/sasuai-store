'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconBox, IconLogout, IconLogin } from '@tabler/icons-react';
import { BatchTable } from './_components/batch-table';
import { StockInTable } from './_components/stock-in-table';
import { StockOutTable } from './_components/stock-out-table';
import BatchPrimaryButton from './_components/batch-primary-button';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('batches');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenForm = (state: boolean) => {
    setDialogOpen(state);
  };

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="batches"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="batches" className="flex items-center gap-1">
            <IconBox size={16} />
            <span>Product Batches</span>
          </TabsTrigger>
          <TabsTrigger
            value="stock-in"
            className="flex items-center gap-1 text-green-500"
          >
            <IconLogin size={16} />
            <span>Stock In</span>
          </TabsTrigger>
          <TabsTrigger
            value="stock-out"
            className="flex items-center gap-1 text-orange-500"
          >
            <IconLogout size={16} />
            <span>Stock Out</span>
          </TabsTrigger>
        </TabsList>

        {/* Batches Tab Content */}
        <TabsContent value="batches" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-x-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Manage Product Batches
                </h2>
                <p className="text-muted-foreground">
                  Track and manage your inventory batches, expiration dates, and
                  stock levels.
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

            {/* Main batch table - now with isActive prop */}
            <BatchTable isActive={activeTab === 'batches'} />
          </div>
        </TabsContent>

        {/* Stock In Tab Content */}
        <TabsContent value="stock-in" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Stock In Records</h2>
              <p className="text-muted-foreground">
                View all stock additions to your inventory
              </p>
            </div>

            {/* Stock In Table - already has isActive prop */}
            <StockInTable isActive={activeTab === 'stock-in'} />
          </div>
        </TabsContent>

        {/* Stock Out Tab Content */}
        <TabsContent value="stock-out" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Stock Out Records</h2>
              <p className="text-muted-foreground">
                View all stock removals from your inventory
              </p>
            </div>

            {/* Stock Out Table - already has isActive prop */}
            <StockOutTable isActive={activeTab === 'stock-out'} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
