'use client';

import { useState, useCallback, useEffect } from 'react';
import { getPaginatedTransactions } from '../action';
import { TransactionWithRelations } from '@/lib/types/transaction';
import TransactionPrimaryButton from './transaction-primary-button';
import { TransactionTable } from './transaction-table';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MainContent() {
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const { toast } = useToast();

  // Track tab counts for display
  const [tabCounts, setTabCounts] = useState({
    all: null as number | null,
    cash: null as number | null,
    card: null as number | null,
    transfer: null as number | null,
  });

  // Load counts for tab headers
  const loadTabCounts = useCallback(async () => {
    try {
      const [allResult, cashResult, cardResult, transferResult] =
        await Promise.all([
          getPaginatedTransactions({ page: 1, pageSize: 1 }),
          getPaginatedTransactions({
            page: 1,
            pageSize: 1,
            paymentMethod: 'cash',
          }),
          getPaginatedTransactions({
            page: 1,
            pageSize: 1,
            paymentMethod: 'card',
          }),
          getPaginatedTransactions({
            page: 1,
            pageSize: 1,
            paymentMethod: 'transfer',
          }),
        ]);

      setTabCounts({
        all:
          allResult.success && allResult.data
            ? allResult.data.totalCount
            : null,
        cash:
          cashResult.success && cashResult.data
            ? cashResult.data.totalCount
            : null,
        card:
          cardResult.success && cardResult.data
            ? cardResult.data.totalCount
            : null,
        transfer:
          transferResult.success && transferResult.data
            ? transferResult.data.totalCount
            : null,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load transaction counts',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Refresh tables and tab counts
  const refreshData = useCallback(() => {
    setRefreshKey(Date.now());
    loadTabCounts();
  }, [loadTabCounts]);

  // Handle dialog open state change
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setSelectedTransaction(null);
  }, []);

  // Handle view transaction details
  const handleView = useCallback((transaction: TransactionWithRelations) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  }, []);

  // Handle transaction operation success
  const handleSuccess = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedTransaction(null);
    refreshData();
  }, [refreshData]);

  // Load tab counts on initial render
  useEffect(() => {
    loadTabCounts();
  }, [loadTabCounts]);

  // Prepare tab content with conditional rendering optimization
  const renderTabContent = (tabValue: string, paymentMethod?: string) => (
    <TabsContent value={tabValue} className="space-y-4">
      {activeTab === tabValue && (
        <TransactionTable
          key={`${tabValue}-${refreshKey}`}
          onView={handleView}
          initialData={
            paymentMethod !== undefined
              ? {
                  transactions: [],
                  totalCount:
                    tabCounts[tabValue as keyof typeof tabCounts] || 0,
                  totalPages: 0,
                  currentPage: 1,
                }
              : undefined
          }
          filterParams={
            paymentMethod !== undefined ? { paymentMethod } : undefined
          }
        />
      )}
    </TabsContent>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Manage Transactions
          </h2>
          <p className="text-muted-foreground">
            View and manage your store transactions
          </p>
        </div>
        <TransactionPrimaryButton
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          initialData={selectedTransaction || undefined}
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
            all: 'All Transactions',
            cash: 'Cash',
            card: 'Card',
            transfer: 'Transfer',
          }).map(([value, label]) => (
            <TabsTrigger key={value} value={value}>
              {label}{' '}
              {tabCounts[value as keyof typeof tabCounts] !== null &&
                `(${tabCounts[value as keyof typeof tabCounts]})`}
            </TabsTrigger>
          ))}
        </TabsList>

        {renderTabContent('all')}
        {renderTabContent('cash', 'cash')}
        {renderTabContent('card', 'card')}
        {renderTabContent('transfer', 'transfer')}
      </Tabs>
    </div>
  );
}
