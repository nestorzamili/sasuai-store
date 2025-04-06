'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPaginatedProducts } from '../action';
import { ProductWithRelations } from '@/lib/types/product';
import ProductPrimaryButton from './product-primary-button';
import { ProductTable } from './product-table';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MainContent() {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const { toast } = useToast();

  // Track tab counts for display
  const [tabCounts, setTabCounts] = useState({
    all: null as number | null,
    active: null as number | null,
    inactive: null as number | null,
  });

  // Load counts for tab headers
  const loadTabCounts = useCallback(async () => {
    try {
      const [allResult, activeResult, inactiveResult] = await Promise.all([
        getPaginatedProducts({ page: 1, pageSize: 1 }),
        getPaginatedProducts({ page: 1, pageSize: 1, isActive: true }),
        getPaginatedProducts({ page: 1, pageSize: 1, isActive: false }),
      ]);

      setTabCounts({
        all:
          allResult.success && allResult.data
            ? allResult.data.totalCount
            : null,
        active:
          activeResult.success && activeResult.data
            ? activeResult.data.totalCount
            : null,
        inactive:
          inactiveResult.success && inactiveResult.data
            ? inactiveResult.data.totalCount
            : null,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tab counts',
        variant: 'destructive',
      });
    }
  }, []);

  // Refresh tables and tab counts
  const refreshData = useCallback(() => {
    setRefreshKey(Date.now());
    loadTabCounts();
  }, [loadTabCounts]);

  // Handle dialog open state change
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setSelectedProduct(null);
  }, []);

  // Handle edit product
  const handleEdit = useCallback((product: ProductWithRelations) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  }, []);

  // Handle product operation success
  const handleSuccess = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
    refreshData();
  }, [refreshData]);

  // Load tab counts on initial render
  useEffect(() => {
    loadTabCounts();
  }, [loadTabCounts]);

  // Prepare tab content with conditional rendering optimization
  const renderTabContent = (
    tabValue: string,
    isActive: boolean | undefined = undefined,
  ) => (
    <TabsContent value={tabValue} className="space-y-4">
      {activeTab === tabValue && (
        <ProductTable
          key={`${tabValue}-${refreshKey}`}
          onEdit={handleEdit}
          initialData={
            isActive !== undefined
              ? {
                  products: [],
                  totalCount:
                    tabCounts[tabValue as keyof typeof tabCounts] || 0,
                  totalPages: 0,
                  currentPage: 1,
                }
              : undefined
          }
          filterParams={isActive !== undefined ? { isActive } : undefined}
        />
      )}
    </TabsContent>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Products</h2>
          <p className="text-muted-foreground">
            View and manage your product inventory
          </p>
        </div>
        <ProductPrimaryButton
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          initialData={selectedProduct || undefined}
          onSuccess={handleSuccess}
        />
      </div>

      <Tabs
        defaultValue="all"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList>
          {Object.entries({
            all: 'All Products',
            active: 'Active',
            inactive: 'Inactive',
          }).map(([value, label]) => (
            <TabsTrigger key={value} value={value}>
              {label}{' '}
              {tabCounts[value as keyof typeof tabCounts] !== null &&
                `(${tabCounts[value as keyof typeof tabCounts]})`}
            </TabsTrigger>
          ))}
        </TabsList>

        {renderTabContent('all')}
        {renderTabContent('active', true)}
        {renderTabContent('inactive', false)}
      </Tabs>
    </div>
  );
}
