'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllRewardsWithClaimCount } from '../actions';
import { RewardWithClaimCount } from '@/lib/types/reward';
import RewardPrimaryButton from './reward-primary-button';
import { RewardTable } from './reward-table';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RewardClaimsContent from './reward-claims-content';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  IconLayoutGrid,
  IconList,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { RewardGrid } from './reward-grid';
import { RewardDeleteDialog } from './reward-delete-dialog';

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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchRewards = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, success } = await getAllRewardsWithClaimCount();
      if (success) {
        const rewardData = (data as RewardWithClaimCount[]) || [];

        // Additional check for expired rewards on client side
        const now = new Date();
        const processedRewards = rewardData.map((reward) => {
          if (
            reward.expiryDate &&
            new Date(reward.expiryDate) < now &&
            reward.isActive
          ) {
            // Mark as inactive in the UI immediately if expired
            return { ...reward, isActive: false };
          }
          return reward;
        });

        setRewards(processedRewards);
        setFilteredRewards(processedRewards);
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
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  useEffect(() => {
    // Filter and sort rewards when searchTerm or sortOrder changes
    let filtered = [...rewards];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (reward) =>
          reward.name.toLowerCase().includes(searchLower) ||
          (reward.description &&
            reward.description.toLowerCase().includes(searchLower)),
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

  // Handle delete reward
  const handleDelete = (reward: RewardWithClaimCount) => {
    setSelectedReward(reward);
    setIsDeleteDialogOpen(true);
  };

  // Handle reward operation success
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedReward(null);
    fetchRewards();
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
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
          <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full max-w-sm">
              <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input
                placeholder="Search rewards..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9 pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-9 px-2.5"
                  onClick={handleClearSearch}
                >
                  <IconX className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <IconLayoutGrid className="h-4 w-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <IconList className="h-4 w-4 mr-1" />
                Table
              </Button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <RewardGrid
              data={filteredRewards}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <RewardTable
              data={filteredRewards}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefresh={fetchRewards}
            />
          )}
        </TabsContent>
        <TabsContent value="claims" className="mt-6">
          <RewardClaimsContent />
        </TabsContent>
      </Tabs>

      {selectedReward && (
        <RewardDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          reward={selectedReward}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
