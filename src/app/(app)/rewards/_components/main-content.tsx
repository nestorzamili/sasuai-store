'use client';

import { useState, useEffect } from 'react';
import { getAllRewardsWithClaimCount } from '../actions';
import { RewardWithClaimCount } from '@/lib/types/reward';
import RewardPrimaryButton from './reward-primary-button';
import { RewardTable } from './reward-table';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RewardClaimsContent from './reward-claims-content';

export default function MainContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [rewards, setRewards] = useState<RewardWithClaimCount[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<
    RewardWithClaimCount[]
  >([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] =
    useState<RewardWithClaimCount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState('rewards');

  const fetchRewards = async () => {
    setIsLoading(true);
    try {
      const { data, success } = await getAllRewardsWithClaimCount();
      if (success) {
        const rewardData = (data as RewardWithClaimCount[]) || [];
        setRewards(rewardData);
        setFilteredRewards(rewardData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch rewards',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  useEffect(() => {
    // Filter and sort rewards when searchTerm or sortOrder changes
    let filtered = [...rewards];

    if (searchTerm) {
      filtered = filtered.filter((reward) =>
        reward.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

    setFilteredRewards(filtered);
  }, [rewards, searchTerm, sortOrder]);

  // Handle dialog reset on close
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedReward(null);
    }
  };

  // Handle edit reward
  const handleEdit = (reward: RewardWithClaimCount) => {
    setSelectedReward(reward);
    setIsDialogOpen(true);
  };

  // Handle reward operation success
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedReward(null);
    fetchRewards();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Rewards</h2>
          <p className="text-muted-foreground">
            Create and manage membership rewards.
          </p>
        </div>
        {activeTab === 'rewards' && (
          <RewardPrimaryButton
            open={isDialogOpen}
            onOpenChange={handleDialogOpenChange}
            initialData={selectedReward || undefined}
            onSuccess={handleSuccess}
          />
        )}
      </div>

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
        <TabsContent value="rewards" className="mt-6">
          <RewardTable
            data={filteredRewards}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefresh={fetchRewards}
          />
        </TabsContent>
        <TabsContent value="claims" className="mt-6">
          <RewardClaimsContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
