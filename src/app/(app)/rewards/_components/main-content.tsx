'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAllRewardsWithClaimCount,
  claimRewardForMember,
  searchMembers,
  getMemberAvailableRewards,
} from '../actions';
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
  IconGift,
} from '@tabler/icons-react';
import { RewardGrid } from './reward-grid';
import { RewardDeleteDialog } from './reward-delete-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ComboBox, ComboBoxOption } from '@/components/ui/combobox';

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

  // Claim reward states
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [availableRewards, setAvailableRewards] = useState<any[]>([]);
  const [selectedRewardId, setSelectedRewardId] = useState('');
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const [memberOptions, setMemberOptions] = useState<ComboBoxOption[]>([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);

  const fetchRewards = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, success } = await getAllRewardsWithClaimCount();
      if (success) {
        const rewardData = (data as RewardWithClaimCount[]) || [];

        const now = new Date();
        const processedRewards = rewardData.map((reward) => {
          if (
            reward.expiryDate &&
            new Date(reward.expiryDate) < now &&
            reward.isActive
          ) {
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

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedReward(null);
    }
  };

  const handleEdit = (reward: RewardWithClaimCount) => {
    setSelectedReward(reward);
    setIsDialogOpen(true);
  };

  const handleDelete = (reward: RewardWithClaimCount) => {
    setSelectedReward(reward);
    setIsDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedReward(null);
    fetchRewards();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const fetchAvailableRewards = useCallback(async (memberId: string) => {
    if (!memberId) return;

    setIsClaimLoading(true);
    setAvailableRewards([]);

    try {
      const result = await getMemberAvailableRewards(memberId);

      if (result.success && result.data) {
        setAvailableRewards(result.data);

        if (result.data.length === 0) {
          toast({
            title: 'No rewards available',
            description: 'This member has no rewards available to claim',
            variant: 'default',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch available rewards',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching available rewards:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching rewards',
        variant: 'destructive',
      });
    } finally {
      setIsClaimLoading(false);
    }
  }, []);

  const searchMembersForComboBox = useCallback(async (query: string) => {
    if (query.length < 2) {
      setMemberOptions([]);
      return;
    }

    setIsSearchingMembers(true);
    try {
      const { success, data } = await searchMembers({
        query,
        page: 1,
        limit: 10,
      });

      if (success && data && data.members) {
        const options: ComboBoxOption[] = data.members.map((member) => ({
          value: member.id,
          label: `${member.name} ${
            member.email
              ? `(${member.email})`
              : member.phone
              ? `(${member.phone})`
              : ''
          }`,
          data: member,
        }));
        setMemberOptions(options);
      }
    } catch (error) {
      console.error('Error searching members:', error);
      toast({
        title: 'Error',
        description: 'Failed to search members',
        variant: 'destructive',
      });
    } finally {
      setIsSearchingMembers(false);
    }
  }, []);

  const handleMemberChange = useCallback(
    (memberId: string) => {
      setSelectedMemberId(memberId);
      setSelectedRewardId('');

      if (memberId) {
        fetchAvailableRewards(memberId);
      } else {
        setAvailableRewards([]);
      }
    },
    [fetchAvailableRewards],
  );

  const handleOpenClaimDialog = useCallback(() => {
    setIsClaimDialogOpen(true);
    setMemberOptions([]);
    setSelectedMemberId('');
    setSelectedRewardId('');
    setAvailableRewards([]);
  }, []);

  const handleClaimReward = async () => {
    if (!selectedMemberId || !selectedRewardId) {
      toast({
        title: 'Invalid selection',
        description: 'Please select both a member and a reward',
        variant: 'destructive',
      });
      return;
    }

    setIsClaimLoading(true);
    try {
      const result = await claimRewardForMember(
        selectedMemberId,
        selectedRewardId,
      );

      if (result.success) {
        toast({
          title: 'Reward claimed',
          description: 'The reward has been successfully claimed',
        });
        setIsClaimDialogOpen(false);
        setSelectedMemberId('');
        setSelectedRewardId('');
        setAvailableRewards([]);
        fetchRewards();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to claim reward',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsClaimLoading(false);
    }
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
        <div className="flex gap-2">
          {activeTab === 'rewards' && (
            <RewardPrimaryButton
              open={isDialogOpen}
              onOpenChange={handleDialogOpenChange}
              initialData={selectedReward || undefined}
              onSuccess={handleSuccess}
            />
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

      <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Claim Reward for Member</DialogTitle>
            <DialogDescription>
              Search for a member and select a reward to claim.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="member">Search Member</Label>
                <ComboBox
                  options={memberOptions}
                  value={selectedMemberId}
                  onChange={handleMemberChange}
                  placeholder="Search for a member..."
                  emptyMessage="No members found. Try a different search."
                  loadingState={isSearchingMembers}
                  customSearchFunction={searchMembersForComboBox}
                  customEmptyComponent={
                    memberOptions.length === 0 && !isSearchingMembers ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Type at least 2 characters to search for members
                      </div>
                    ) : undefined
                  }
                />
              </div>

              {selectedMemberId && (
                <div className="space-y-2">
                  <Label htmlFor="reward">Select Reward</Label>
                  {isClaimLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent text-primary rounded-full mr-2" />
                      <p className="text-sm">Loading available rewards...</p>
                    </div>
                  ) : availableRewards.length > 0 ? (
                    <Select
                      value={selectedRewardId}
                      onValueChange={setSelectedRewardId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reward" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRewards.map((reward) => (
                          <SelectItem key={reward.id} value={reward.id}>
                            {reward.name} ({reward.pointsCost} points)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No rewards available for this member to claim. Either they
                      don't have enough points or there are no active rewards.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsClaimDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClaimReward}
              disabled={
                isClaimLoading ||
                !selectedMemberId ||
                !selectedRewardId ||
                availableRewards.length === 0
              }
            >
              {isClaimLoading ? 'Processing...' : 'Claim Reward'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
