'use client';

import { useState } from 'react';
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State for Dialogs
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);

  // Data for Dialogs
  const [selectedRewardForEdit, setSelectedRewardForEdit] =
    useState<RewardWithClaimCount | null>(null);
  const [selectedRewardForDelete, setSelectedRewardForDelete] =
    useState<RewardWithClaimCount | null>(null);

  // Handlers for opening dialogs
  const handleOpenCreateDialog = () => {
    setSelectedRewardForEdit(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenEditDialog = (reward: RewardWithClaimCount) => {
    setSelectedRewardForEdit(reward);
    setIsFormDialogOpen(true);
  };

  const handleOpenDeleteDialog = (reward: RewardWithClaimCount) => {
    setSelectedRewardForDelete(reward);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenClaimDialog = () => {
    setIsClaimDialogOpen(true);
  };

  // Handler for successful operations that require data refresh
  const handleSuccess = () => {
    setIsFormDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsClaimDialogOpen(false);
    setSelectedRewardForEdit(null);
    setSelectedRewardForDelete(null);
    setRefreshTrigger((prev) => prev + 1);
  };

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
            key={`reward-table-${refreshTrigger}`}
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
