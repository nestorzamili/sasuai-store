'use client';

import { useState, lazy, Suspense, useRef, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconBox, IconLogout, IconLogin } from '@tabler/icons-react';
import { BatchTable } from './_components/batch-table';
import BatchPrimaryButton from './_components/batch-primary-button';

// Lazy load components that aren't immediately needed
const LazyStockInTable = lazy(() =>
  import('./_components/stock-in-table').then((module) => ({
    default: module.StockInTable,
  }))
);

const LazyStockOutTable = lazy(() =>
  import('./_components/stock-out-table').then((module) => ({
    default: module.StockOutTable,
  }))
);

export default function InventoryPage() {
  const t = useTranslations('inventory');
  const [activeTab, setActiveTab] = useState('batches');
  const [dialogOpen, setDialogOpen] = useState(false);
  // Create a ref to store the refresh function from BatchTable
  const batchTableRefreshFn = useRef<() => void>(() => {});

  // Memoize handlers to prevent unnecessary re-renders
  const handleOpenForm = useCallback((state: boolean) => {
    setDialogOpen(state);
  }, []);

  // Update handleSuccess to call the refresh function
  const handleSuccess = useCallback(() => {
    // Call the batch table refresh function when a batch is created successfully
    batchTableRefreshFn.current();
  }, []);

  // Function to capture the refresh function from BatchTable
  const setBatchTableRefresh = useCallback((refreshFn: () => void) => {
    batchTableRefreshFn.current = refreshFn;
  }, []);

  // Memoize the loading fallback
  const LoadingFallback = useMemo(
    () => (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
    []
  );

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
            <span>{t('tabs.batches')}</span>
          </TabsTrigger>
          <TabsTrigger
            value="stock-in"
            className="flex items-center gap-1 text-green-500"
          >
            <IconLogin size={16} />
            <span>{t('tabs.stockIn')}</span>
          </TabsTrigger>
          <TabsTrigger
            value="stock-out"
            className="flex items-center gap-1 text-orange-500"
          >
            <IconLogout size={16} />
            <span>{t('tabs.stockOut')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Batches Tab Content - Always render this as it's the default tab */}
        <TabsContent value="batches" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-x-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {t('batches.title')}
                </h2>
                <p className="text-muted-foreground">
                  {t('batches.description')}
                </p>
              </div>
              <BatchPrimaryButton
                open={dialogOpen}
                onOpenChange={handleOpenForm}
                onSuccess={handleSuccess}
              />
            </div>

            {/* Main batch table with isActive prop and onSetRefresh to capture the refresh function */}
            <BatchTable
              isActive={activeTab === 'batches'}
              onSetRefresh={setBatchTableRefresh}
            />
          </div>
        </TabsContent>

        {/* Stock In Tab Content - Lazy load */}
        <TabsContent value="stock-in" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">{t('stockIn.title')}</h2>
              <p className="text-muted-foreground">
                {t('stockIn.description')}
              </p>
            </div>

            {/* Lazy loaded Stock In Table using TableLayout's loading state */}
            <Suspense fallback={LoadingFallback}>
              {activeTab === 'stock-in' && <LazyStockInTable isActive={true} />}
            </Suspense>
          </div>
        </TabsContent>

        {/* Stock Out Tab Content - Lazy load */}
        <TabsContent value="stock-out" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">{t('stockOut.title')}</h2>
              <p className="text-muted-foreground">
                {t('stockOut.description')}
              </p>
            </div>

            {/* Lazy loaded Stock Out Table using TableLayout's loading state */}
            <Suspense fallback={LoadingFallback}>
              {activeTab === 'stock-out' && (
                <LazyStockOutTable isActive={true} />
              )}
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
