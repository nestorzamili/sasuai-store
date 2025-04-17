'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ComboBox } from '@/components/ui/combobox';
import { toast } from '@/hooks/use-toast';
import {
  claimRewardForMember,
  getMemberAvailableRewards,
  searchMembers,
} from '../actions';

// Define ComboBoxOption interface
interface ComboBoxOption {
  value: string;
  label: string;
  data?: any;
}

interface ClaimRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ClaimRewardDialog({
  open,
  onOpenChange,
  onSuccess,
}: ClaimRewardDialogProps) {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [availableRewards, setAvailableRewards] = useState<any[]>([]);
  const [selectedRewardId, setSelectedRewardId] = useState('');
  const [isLoadingRewards, setIsLoadingRewards] = useState(false); // For fetching rewards
  const [isClaimingReward, setIsClaimingReward] = useState(false); // For claim action
  const [memberOptions, setMemberOptions] = useState<ComboBoxOption[]>([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);

  const resetDialogState = useCallback(() => {
    setSelectedMemberId('');
    setAvailableRewards([]);
    setSelectedRewardId('');
    setMemberOptions([]);
    setIsLoadingRewards(false);
    setIsClaimingReward(false);
    setIsSearchingMembers(false);
  }, []);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      const timer = setTimeout(() => resetDialogState(), 150); // Delay reset to allow closing animation
      return () => clearTimeout(timer);
    }
  }, [open, resetDialogState]);

  const fetchAvailableRewards = useCallback(async (memberId: string) => {
    if (!memberId) return;

    setIsLoadingRewards(true);
    setAvailableRewards([]);
    setSelectedRewardId(''); // Reset reward selection when member changes

    try {
      const result = await getMemberAvailableRewards(memberId);

      if (result.success && result.data) {
        setAvailableRewards(result.data);
        if (result.data.length === 0) {
          toast({
            title: 'No rewards available',
            description: 'This member has no rewards available to claim.',
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
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching rewards',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRewards(false);
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
      } else {
        setMemberOptions([]);
      }
    } catch (error) {
      setMemberOptions([]);
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
      if (memberId) {
        fetchAvailableRewards(memberId);
      } else {
        setAvailableRewards([]);
        setSelectedRewardId('');
      }
    },
    [fetchAvailableRewards],
  );

  const handleClaimReward = async () => {
    if (!selectedMemberId || !selectedRewardId) {
      toast({
        title: 'Invalid selection',
        description: 'Please select both a member and a reward',
        variant: 'destructive',
      });
      return;
    }

    setIsClaimingReward(true);
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
        onSuccess(); // Trigger refresh in parent
        onOpenChange(false); // Close dialog
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to claim reward',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsClaimingReward(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                {isLoadingRewards ? ( // Only show loading for rewards fetch, not for claiming
                  <div className="flex items-center justify-center p-2">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent text-primary rounded-full mr-2" />
                    <p className="text-sm">Loading available rewards...</p>
                  </div>
                ) : availableRewards.length > 0 ? (
                  <Select
                    value={selectedRewardId}
                    onValueChange={setSelectedRewardId}
                    disabled={isClaimingReward}
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
                  <p className="text-sm text-muted-foreground pt-2">
                    No rewards available for this member to claim.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleClaimReward}
            disabled={
              isLoadingRewards ||
              isClaimingReward ||
              !selectedMemberId ||
              !selectedRewardId ||
              availableRewards.length === 0
            }
          >
            {isClaimingReward ? 'Processing...' : 'Claim Reward'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
