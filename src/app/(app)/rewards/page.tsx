'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllRewardsWithClaimCount } from './actions';
import { RewardWithClaimCount } from '@/lib/types/reward';
import RewardPrimaryButton from './_components/reward-primary-button';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { IconGift } from '@tabler/icons-react';
import { RewardListView } from './_components/reward-list-view';
import { RewardDeleteDialog } from './_components/reward-delete-dialog';
import RewardFormDialog from './_components/reward-form-dialog';
import { ClaimRewardDialog } from './_components/claim-reward-dialog';
import { RewardClaimsTable } from './_components/reward-claims-table';

export default function RewardsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [rewards, setRewards] = useState<RewardWithClaimCount[]>([]);
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

  // Fetch initial rewards data
  const fetchRewards = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, success } = await getAllRewardsWithClaimCount();
      if (success && data) {
        const rewardData = (data as RewardWithClaimCount[]) || [];
        setRewards(rewardData);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch rewards',
          variant: 'destructive',
        });
        setRewards([]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching rewards',
        variant: 'destructive',
      });
      setRewards([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

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
    fetchRewards();
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
        <TabsContent value="rewards" className="mt-6">
          <RewardListView
            rewards={rewards}
            isLoading={isLoading}
            onEdit={handleOpenEditDialog}
            onDelete={handleOpenDeleteDialog}
            onRefresh={fetchRewards}
          />
        </TabsContent>

        {/* Claims History Tab */}
        <TabsContent value="claims" className="mt-2">
          <div className="space-y-4">
            <RewardClaimsTable />
          </div>
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
