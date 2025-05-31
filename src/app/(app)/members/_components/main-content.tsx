'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { getAllMemberTiers, awardPointsToMember } from '../action';
import { MemberWithTier, MemberTier } from '@/lib/types/member';
import MemberPrimaryButton from './member-primary-button';
import { MemberTable } from './member-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import TiersContent from './tiers-content';
import PointRulesContent from './point-rules-content';
import { Button } from '@/components/ui/button';
import { IconCrown } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function MainContent() {
  const t = useTranslations('member');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberWithTier | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState('members');
  const [tiers, setTiers] = useState<MemberTier[]>([]);

  // Award points state
  const [isAwardPointsOpen, setIsAwardPointsOpen] = useState(false);
  const [memberForPoints, setMemberForPoints] = useState<MemberWithTier | null>(
    null,
  );
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [pointNotes, setPointNotes] = useState('');
  const [isAwarding, setIsAwarding] = useState(false);

  const fetchTiers = async () => {
    try {
      const { data, success } = await getAllMemberTiers();
      if (success && data) {
        setTiers(data);
      }
    } catch (error) {
      console.error('Failed to fetch member tiers:', error);
      toast({
        title: t('common.error'),
        description: t('errors.failedToFetchTiers'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  // Handle dialog reset on close
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedMember(null);
    }
  };

  // Handle edit member - stabilize with useCallback
  const handleEdit = useCallback((member: MemberWithTier) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  }, []);

  // Handle member operation success
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedMember(null);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Remove the fetchTiers() call here as it's causing unnecessary re-renders
  };

  // Handle award points dialog - stabilize with useCallback
  const handleOpenAwardPoints = useCallback((member: MemberWithTier) => {
    setMemberForPoints(member);
    setIsAwardPointsOpen(true);
  }, []);

  const handleAwardPointsOpenChange = (open: boolean) => {
    setIsAwardPointsOpen(open);
    if (!open) {
      resetAwardPointsForm();
    }
  };

  const resetAwardPointsForm = () => {
    setPointsToAdd(0);
    setPointNotes('');
    setMemberForPoints(null);
  };

  // Handle award points submission
  const handleAwardPoints = async () => {
    if (!memberForPoints || pointsToAdd <= 0) {
      toast({
        title: t('awardPoints.invalidInput'),
        description: t('awardPoints.invalidInputDescription'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAwarding(true);

      const result = await awardPointsToMember(
        memberForPoints.id,
        pointsToAdd,
        pointNotes,
      );

      if (result.success) {
        toast({
          title: t('awardPoints.success'),
          description: t('awardPoints.successDescription', {
            points: pointsToAdd,
            name: memberForPoints.name,
          }),
        });
        setIsAwardPointsOpen(false);
        resetAwardPointsForm();
      } else {
        toast({
          title: t('common.error'),
          description: result.error || t('awardPoints.failed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to award points:', error);
      toast({
        title: t('common.error'),
        description: t('common.unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setIsAwarding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        {activeTab === 'members' && (
          <div className="flex gap-2">
            <MemberPrimaryButton
              open={isDialogOpen}
              onOpenChange={handleDialogOpenChange}
              initialData={selectedMember || undefined}
              tiers={tiers}
              onSuccess={handleSuccess}
            />
          </div>
        )}
      </div>

      <Tabs
        defaultValue="members"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="members">{t('tabs.members')}</TabsTrigger>
          <TabsTrigger value="tiers">{t('tabs.tiers')}</TabsTrigger>
          <TabsTrigger value="pointRules">{t('tabs.pointRules')}</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="mt-6">
          <MemberTable
            onEdit={handleEdit}
            onAwardPoints={handleOpenAwardPoints}
          />
        </TabsContent>
        <TabsContent value="tiers" className="mt-6">
          <TiersContent
            tiers={tiers}
            onSuccess={handleSuccess}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="pointRules" className="mt-6">
          <PointRulesContent />
        </TabsContent>
      </Tabs>

      {/* Award Points Dialog */}
      <Dialog
        open={isAwardPointsOpen}
        onOpenChange={handleAwardPointsOpenChange}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('awardPoints.title')}</DialogTitle>
            <DialogDescription>
              {memberForPoints
                ? t('awardPoints.description', { name: memberForPoints.name })
                : t('awardPoints.defaultDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="points">{t('awardPoints.pointsToAward')}</Label>
                <Input
                  id="points"
                  type="number"
                  value={pointsToAdd || ''}
                  onChange={(e) =>
                    setPointsToAdd(parseInt(e.target.value) || 0)
                  }
                  placeholder={t('awardPoints.pointsPlaceholder')}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('awardPoints.notes')}</Label>
                <Textarea
                  id="notes"
                  value={pointNotes}
                  onChange={(e) => setPointNotes(e.target.value)}
                  placeholder={t('awardPoints.notesPlaceholder')}
                />
              </div>

              {memberForPoints && memberForPoints.tier && (
                <div className="rounded-md bg-secondary/50 p-3 text-sm">
                  <div className="font-semibold mb-1 flex items-center">
                    <IconCrown size={16} className="mr-1 text-amber-500" />
                    {t('awardPoints.multiplierActive')}
                  </div>
                  <p>
                    {t('awardPoints.multiplierDescription', {
                      multiplier: memberForPoints.tier.multiplier,
                      tierName: memberForPoints.tier.name,
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAwardPointsOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleAwardPoints}
              disabled={isAwarding || pointsToAdd <= 0 || !memberForPoints}
            >
              {isAwarding
                ? t('awardPoints.awarding')
                : t('awardPoints.awardButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
