'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainContent from './main-content';
import StockInContent from './stock-in-content';
import StockOutContent from './stock-out-content';
import { IconBox, IconLogout, IconLogin } from '@tabler/icons-react';

export function InventoryTabs() {
  const [activeTab, setActiveTab] = useState('batches');

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
          <TabsTrigger value="stock-in" className="flex items-center gap-1">
            <IconLogin size={16} />
            <span>Stock In</span>
          </TabsTrigger>
          <TabsTrigger value="stock-out" className="flex items-center gap-1">
            <IconLogout size={16} />
            <span>Stock Out</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="mt-6">
          <MainContent />
        </TabsContent>

        <TabsContent value="stock-in" className="mt-6">
          <StockInContent />
        </TabsContent>

        <TabsContent value="stock-out" className="mt-6">
          <StockOutContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
