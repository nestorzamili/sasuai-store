'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  claimRewardForMember,
  searchMembers,
  getAllRewardsWithClaimCount,
} from '../actions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Loader2, X } from 'lucide-react';
import { Member, RewardWithClaimCount, LoadingState } from '@/lib/types/reward';

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
  const t = useTranslations('reward.claimDialog');
  const tCommon = useTranslations('reward.common');

  // Main state
  const [selectedRewardId, setSelectedRewardId] = useState<string>('');
  const [availableRewards, setAvailableRewards] = useState<
    RewardWithClaimCount[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchResults, setSearchResults] = useState<Member[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState<LoadingState>({
    rewards: false,
    search: false,
    claim: false,
  });
  const [showResults, setShowResults] = useState<boolean>(false);

  // Refs for click outside detection
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Selected reward details
  const selectedReward = useMemo(
    (): RewardWithClaimCount | undefined =>
      availableRewards.find((r) => r.id === selectedRewardId),
    [availableRewards, selectedRewardId],
  );

  // Check if member has enough points
  const hasEnoughPoints = useMemo(
    (): boolean =>
      selectedMember && selectedReward
        ? selectedMember.totalPoints >= selectedReward.pointsCost
        : false,
    [selectedMember, selectedReward],
  );

  // Memoized functions to prevent unnecessary re-renders
  const fetchRewards = useCallback(async (): Promise<void> => {
    setIsLoading((prev) => ({ ...prev, rewards: true }));

    try {
      const result = await getAllRewardsWithClaimCount({
        limit: 100,
        includeInactive: false,
      });

      if (result.success && result.data) {
        const available = result.data.rewards.filter(
          (reward: RewardWithClaimCount) => reward.isActive && reward.stock > 0,
        );
        setAvailableRewards(available);

        if (available.length === 0) {
          toast({
            title: t('fields.noRewardsFound'),
            description: t('noRewardsAvailable'),
          });
        }
      } else {
        toast({
          title: tCommon('error'),
          description: result.error || t('error.failed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Fetch rewards error:', error);
      toast({
        title: tCommon('error'),
        description: t('error.unexpected'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, rewards: false }));
    }
  }, [t, tCommon]);

  const searchMembersHandler = useCallback(
    async (query: string): Promise<void> => {
      if (query.trim().length < 3) return;

      setIsLoading((prev) => ({ ...prev, search: true }));

      try {
        const result = await searchMembers({
          query,
          limit: 10,
        });

        if (result.success && result.data?.members) {
          setSearchResults(result.data.members);
          setShowResults(true);
        } else {
          setSearchResults([]);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search members error:', error);
        toast({
          title: 'Error',
          description: 'Failed to search for members',
          variant: 'destructive',
        });
        setSearchResults([]);
      } finally {
        setIsLoading((prev) => ({ ...prev, search: false }));
      }
    },
    [],
  );

  const handleSelectMember = useCallback(
    (member: Member): void => {
      if (member.isBanned === true) {
        toast({
          title: t('memberBanned'),
          description: t('memberBannedDescription'),
          variant: 'destructive',
        });
        return;
      }

      setSelectedMember(member);
      setShowResults(false);
      setSearchQuery('');
    },
    [t],
  );

  const getTierBadgeVariant = useCallback((tierName?: string): string => {
    if (!tierName) return 'secondary';

    const lowerTier = tierName.toLowerCase();
    if (lowerTier.includes('gold') || lowerTier.includes('premium'))
      return 'default';
    if (lowerTier.includes('silver') || lowerTier.includes('plus'))
      return 'secondary';
    if (lowerTier.includes('platinum') || lowerTier.includes('vip'))
      return 'primary';

    return 'secondary';
  }, []);

  // Reset dialog state when closed
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setSelectedRewardId('');
        setSearchQuery('');
        setSelectedMember(null);
        setSearchResults([]);
        setShowResults(false);
      }, 200);
      return () => clearTimeout(timer);
    } else if (open && availableRewards.length === 0) {
      fetchRewards();
    }
  }, [open, availableRewards.length, fetchRewards]);

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search effect with cleanup
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 3) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchMembersHandler(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchMembersHandler]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();

      if (!selectedRewardId || !selectedMember) return;

      if (!hasEnoughPoints) {
        toast({
          title: t('error.insufficientPoints'),
          description: t('error.insufficientPointsMessage'),
          variant: 'destructive',
        });
        return;
      }

      setIsLoading((prev) => ({ ...prev, claim: true }));

      try {
        const result = await claimRewardForMember(
          selectedMember.id,
          selectedRewardId,
        );

        if (result.success) {
          toast({
            title: t('success'),
            description: t('successMessage'),
          });
          onSuccess();
          onOpenChange(false);
        } else {
          toast({
            title: t('error.failed'),
            description: result.error || t('error.failed'),
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Claim reward error:', error);
        toast({
          title: t('error.failed'),
          description: t('error.unexpected'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading((prev) => ({ ...prev, claim: false }));
      }
    },
    [
      selectedRewardId,
      selectedMember,
      hasEnoughPoints,
      onSuccess,
      onOpenChange,
      t,
    ],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Reward Selection */}
            <div className="grid gap-2">
              <Label htmlFor="reward-select">{t('fields.reward')}</Label>
              <Select
                value={selectedRewardId}
                onValueChange={setSelectedRewardId}
              >
                <SelectTrigger id="reward-select">
                  <SelectValue placeholder={t('fields.rewardPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {isLoading.rewards ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>{tCommon('loading')}</span>
                    </div>
                  ) : availableRewards.length > 0 ? (
                    availableRewards.map((reward) => (
                      <SelectItem key={reward.id} value={reward.id}>
                        {reward.name} - {reward.pointsCost} {tCommon('points')}{' '}
                        ({reward.stock} {t('stockAvailable')})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-muted-foreground">
                      {t('fields.noRewardsFound')}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Reward Details */}
            {selectedReward && (
              <Card className="mb-2">
                <CardContent className="pt-6">
                  <div className="grid gap-2">
                    <div className="text-lg font-medium">
                      {selectedReward.name}
                    </div>
                    {selectedReward.description && (
                      <div className="text-muted-foreground">
                        {selectedReward.description}
                      </div>
                    )}
                    <div className="font-semibold text-amber-600">
                      {selectedReward.pointsCost}{' '}
                      {t('rewardInfo.pointsRequired')}
                    </div>
                    <div className="text-sm">
                      {selectedReward.stock} {t('rewardInfo.stockAvailable')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Member Search */}
            <div className="grid gap-2">
              <Label>{t('fields.member')}</Label>
              <div className="relative">
                <Input
                  ref={inputRef}
                  placeholder={t('fields.memberPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-16 h-9"
                  disabled={!!selectedMember}
                />

                {searchQuery && !isLoading.search && !selectedMember && (
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="absolute right-10 top-0 h-full w-8"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}

                <Button
                  size="icon"
                  type="button"
                  className="absolute right-0 top-0 h-full rounded-l-none w-10"
                  onClick={
                    selectedMember
                      ? () => setSelectedMember(null)
                      : () => searchMembersHandler(searchQuery)
                  }
                  disabled={
                    selectedMember
                      ? false
                      : searchQuery.trim().length < 3 || isLoading.search
                  }
                >
                  {selectedMember ? (
                    <X className="h-4 w-4" />
                  ) : isLoading.search ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>

                {/* Search results dropdown */}
                {showResults && searchResults.length > 0 && !selectedMember && (
                  <Card
                    className="absolute z-50 w-full left-0 right-0 mt-1 max-h-64 overflow-auto"
                    ref={resultsRef}
                  >
                    <ul className="py-1 divide-y divide-border">
                      {searchResults.map((member) => (
                        <li
                          key={member.id}
                          className={`px-3 py-2 transition-colors ${
                            member.isBanned === true
                              ? 'cursor-not-allowed opacity-70'
                              : 'cursor-pointer hover:bg-accent'
                          }`}
                          onClick={() =>
                            member.isBanned !== true &&
                            handleSelectMember(member)
                          }
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{member.name}</p>
                                {member.isBanned === true && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    {t('banned')}
                                  </Badge>
                                )}
                              </div>
                              {(member.phone || member.email) && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {member.phone && (
                                    <span>Phone: {member.phone}</span>
                                  )}
                                  {member.email && (
                                    <span className="block sm:inline sm:ml-2">
                                      Email: {member.email}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="sm:text-right mt-2 sm:mt-0">
                              <div className="flex sm:justify-end">
                                <Badge
                                  className={getTierBadgeVariant(
                                    member.tier?.name,
                                  )}
                                >
                                  {member.tier?.name || t('regularTier')}
                                </Badge>
                              </div>
                              <p className="text-xs text-amber-500 mt-1">
                                {t('memberInfo.currentPoints')}:{' '}
                                {member.totalPoints}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>

              {!isLoading.search &&
                searchQuery.trim().length >= 3 &&
                searchResults.length === 0 &&
                showResults &&
                !selectedMember && (
                  <div className="text-xs text-muted-foreground flex items-center pt-0.5">
                    <X className="h-3 w-3 mr-1" />
                    {t('fields.noMembersFound')}
                  </div>
                )}
            </div>

            {/* Selected Member Details */}
            {selectedMember && (
              <Card className="mb-2">
                <CardContent className="pt-6">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{selectedMember.name}</div>
                        <Badge
                          className={getTierBadgeVariant(
                            selectedMember.tier?.name,
                          )}
                        >
                          {selectedMember.tier?.name || t('regularTier')}
                        </Badge>
                      </div>
                      {(selectedMember.phone || selectedMember.email) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {selectedMember.phone && (
                            <span>{selectedMember.phone}</span>
                          )}
                          {selectedMember.email && (
                            <span className="ml-2">{selectedMember.email}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-amber-600 font-medium">
                        {selectedMember.totalPoints} {tCommon('points')}
                      </div>
                      {selectedReward && !hasEnoughPoints && (
                        <div className="text-destructive text-xs">
                          {t('rewardInfo.insufficientPoints')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isLoading.claim}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading.claim ||
                !selectedMember ||
                !selectedRewardId ||
                !hasEnoughPoints
              }
            >
              {isLoading.claim ? t('processing') : t('claimButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
