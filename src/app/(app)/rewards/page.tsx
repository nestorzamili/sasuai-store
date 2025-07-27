'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import RewardPrimaryButton from './_components/reward-primary-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { IconGift } from '@tabler/icons-react';
import { RewardTable } from './_components/reward-table';
import { RewardDeleteDialog } from './_components/reward-delete-dialog';
import RewardFormDialog from './_components/reward-form-dialog';
import { ClaimRewardDialog } from './_components/claim-reward-dialog';
import { RewardClaimsTable } from './_components/reward-claims-table';
import { RewardWithClaimCount } from '@/lib/types/reward';

export default function RewardsPage() {
  const t = useTranslations('reward');
  const [activeTab, setActiveTab] = useState('rewards');

  // State for Dialogs
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);

  // Data for Dialogs
  const [selectedRewardForEdit, setSelectedRewardForEdit] =
    useState<RewardWithClaimCount | null>(null);
  const [selectedRewardForDelete, setSelectedRewardForDelete] =
    useState<RewardWithClaimCount | null>(null);

  // Ref to store the table refresh function
  const tableRefreshRef = useRef<(() => void) | null>(null);

  // Handler to capture the table refresh function
  const handleTableRefresh = useCallback((refreshFn: () => void) => {
    tableRefreshRef.current = refreshFn;
  }, []);

  // Handlers for opening dialogs - stabilize with useCallback
  const handleOpenCreateDialog = useCallback(() => {
    setSelectedRewardForEdit(null);
    setIsFormDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((reward: RewardWithClaimCount) => {
    setSelectedRewardForEdit(reward);
    setIsFormDialogOpen(true);
  }, []);

  const handleOpenDeleteDialog = useCallback((reward: RewardWithClaimCount) => {
    setSelectedRewardForDelete(reward);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleOpenClaimDialog = useCallback(() => {
    setIsClaimDialogOpen(true);
  }, []);

  // Handler for successful operations that require data refresh - stabilize with useCallback
  const handleSuccess = useCallback(() => {
    setIsFormDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsClaimDialogOpen(false);
    setSelectedRewardForEdit(null);
    setSelectedRewardForDelete(null);

    // Refresh the table data
    if (tableRefreshRef.current) {
      tableRefreshRef.current();
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'rewards' && (
            <RewardPrimaryButton onClick={handleOpenCreateDialog} />
          )}
          <Button
            variant="outline"
            onClick={handleOpenClaimDialog}
            className="gap-1"
          >
            <IconGift size={16} />
            {t('buttons.claimReward')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="rewards"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="rewards">{t('tabs.rewards')}</TabsTrigger>
          <TabsTrigger value="claims">{t('tabs.claims')}</TabsTrigger>
        </TabsList>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="mt-4">
          <RewardTable
            onEdit={handleOpenEditDialog}
            onDelete={handleOpenDeleteDialog}
            onRefresh={handleTableRefresh}
          />
        </TabsContent>

        {/* Claims History Tab */}
        <TabsContent value="claims" className="mt-4">
          <RewardClaimsTable />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <RewardFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        initialData={selectedRewardForEdit || undefined}
        onSuccess={handleSuccess}
      />

      {selectedRewardForDelete && (
        <RewardDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          reward={selectedRewardForDelete}
          onSuccess={handleSuccess}
        />
      )}

      <ClaimRewardDialog
        open={isClaimDialogOpen}
        onOpenChange={setIsClaimDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
