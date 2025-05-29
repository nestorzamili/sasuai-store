'use client';

import { useState, useCallback } from 'react';
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
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Rewards</h2>
          <p className="text-muted-foreground">
            Create, manage, and track membership rewards and claims.
          </p>
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
            Claim Reward
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
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="claims">Claims History</TabsTrigger>
        </TabsList>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="mt-4">
          <RewardTable
            onEdit={handleOpenEditDialog}
            onDelete={handleOpenDeleteDialog}
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
