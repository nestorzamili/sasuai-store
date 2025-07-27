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
    [availableRewards, selectedRewardId]
  );

  // Check if member has enough points
  const hasEnoughPoints = useMemo(
    (): boolean =>
      selectedMember && selectedReward
        ? selectedMember.totalPoints >= selectedReward.pointsCost
        : false,
    [selectedMember, selectedReward]
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
          (reward: RewardWithClaimCount) => reward.isActive && reward.stock > 0
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
    []
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
    [t]
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
          selectedRewardId
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
    ]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isLoading.rewards ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin mr-3" />
              <span className="text-sm text-muted-foreground">
                {tCommon('loading')} rewards...
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Reward Selection */}
              <div className="space-y-3">
                <Label htmlFor="reward-select" className="text-sm font-medium">
                  {t('fields.reward')}
                </Label>
                <Select
                  value={selectedRewardId}
                  onValueChange={setSelectedRewardId}
                >
                  <SelectTrigger id="reward-select" className="h-10">
                    <SelectValue placeholder={t('fields.rewardPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {availableRewards.length > 0 ? (
                      availableRewards.map((reward) => (
                        <SelectItem
                          key={reward.id}
                          value={reward.id}
                          className="py-3"
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{reward.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {reward.pointsCost} {tCommon('points')} •{' '}
                              {reward.stock} {t('stockAvailable')}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        {t('fields.noRewardsFound')}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Reward Details */}
              {selectedReward && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-base leading-tight">
                            {selectedReward.name}
                          </h4>
                          {selectedReward.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {selectedReward.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="font-medium">
                            {selectedReward.pointsCost}{' '}
                            {t('rewardInfo.pointsRequired')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {selectedReward.stock}{' '}
                            {t('rewardInfo.stockAvailable')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Member Search */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t('fields.member')}
                </Label>
                <div className="relative">
                  <Input
                    ref={inputRef}
                    placeholder={t('fields.memberPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-20 h-10"
                    disabled={!!selectedMember}
                  />

                  <div className="absolute right-1 top-1 flex gap-1">
                    {searchQuery && !isLoading.search && !selectedMember && (
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="h-8 w-8 p-0"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      type="button"
                      className="h-8 w-8 p-0"
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
                  </div>

                  {/* Search results dropdown */}
                  {showResults &&
                    searchResults.length > 0 &&
                    !selectedMember && (
                      <Card
                        className="absolute z-50 w-full left-0 right-0 mt-2 max-h-64 overflow-auto border shadow-lg"
                        ref={resultsRef}
                      >
                        <div className="py-2">
                          {searchResults.map((member) => (
                            <div
                              key={member.id}
                              className={`px-4 py-3 transition-colors border-b last:border-b-0 ${
                                member.isBanned === true
                                  ? 'cursor-not-allowed opacity-70 bg-destructive/5'
                                  : 'cursor-pointer hover:bg-accent'
                              }`}
                              onClick={() =>
                                member.isBanned !== true &&
                                handleSelectMember(member)
                              }
                            >
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                      {member.name}
                                    </span>
                                    {member.isBanned === true && (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs px-1.5 py-0.5"
                                      >
                                        {t('banned')}
                                      </Badge>
                                    )}
                                    <Badge
                                      variant={
                                        getTierBadgeVariant(
                                          member.tier?.name
                                        ) as any
                                      }
                                      className="text-xs px-1.5 py-0.5"
                                    >
                                      {member.tier?.name || t('regularTier')}
                                    </Badge>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-medium text-amber-600">
                                      {member.totalPoints} {tCommon('points')}
                                    </p>
                                  </div>
                                </div>
                                {(member.phone || member.email) && (
                                  <div className="text-xs text-muted-foreground space-y-1">
                                    {member.phone && (
                                      <div>📞 {member.phone}</div>
                                    )}
                                    {member.email && (
                                      <div>✉️ {member.email}</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                </div>

                {!isLoading.search &&
                  searchQuery.trim().length >= 3 &&
                  searchResults.length === 0 &&
                  showResults &&
                  !selectedMember && (
                    <div className="text-xs text-muted-foreground flex items-center mt-2 p-2 bg-muted/30 rounded-md">
                      <X className="h-3 w-3 mr-1" />
                      {t('fields.noMembersFound')}
                    </div>
                  )}
              </div>

              {/* Selected Member Details */}
              {selectedMember && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-base">
                            {selectedMember.name}
                          </h4>
                          <Badge
                            variant={
                              getTierBadgeVariant(
                                selectedMember.tier?.name
                              ) as any
                            }
                            className="text-xs"
                          >
                            {selectedMember.tier?.name || t('regularTier')}
                          </Badge>
                        </div>
                        {(selectedMember.phone || selectedMember.email) && (
                          <div className="space-y-1 text-xs text-muted-foreground">
                            {selectedMember.phone && (
                              <div className="flex items-center gap-1">
                                <span>📞</span>
                                <span>{selectedMember.phone}</span>
                              </div>
                            )}
                            {selectedMember.email && (
                              <div className="flex items-center gap-1">
                                <span>✉️</span>
                                <span>{selectedMember.email}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-medium">
                            {selectedMember.totalPoints} {tCommon('points')}
                          </Badge>
                        </div>
                        {selectedReward && !hasEnoughPoints && (
                          <div className="text-destructive text-xs font-medium">
                            {t('rewardInfo.insufficientPoints')}
                          </div>
                        )}
                        {selectedReward && hasEnoughPoints && (
                          <div className="text-green-600 text-xs font-medium">
                            ✓{' '}
                            {t('rewardInfo.sufficientPoints') ||
                              'Sufficient points'}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isLoading.claim}
              className="flex-1 sm:flex-none"
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
              className="flex-1 sm:flex-none"
            >
              {isLoading.claim && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {isLoading.claim ? t('processing') : t('claimButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
