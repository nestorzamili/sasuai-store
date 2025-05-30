'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MemberWithRelations, MemberTier } from '@/lib/types/member';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { MemberTierBadge } from '../../_components/member-tier-badge';
import {
  IconEdit,
  IconCrown,
  IconClock,
  IconBan,
  IconShieldCheck,
} from '@tabler/icons-react';
import MemberFormDialog from '../../_components/member-form-dialog';
import { getAllMemberTiers } from '../../action';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { unbanMember } from '../../action';

interface MemberProfileProps {
  member: MemberWithRelations;
  onUpdate: () => void;
}

export default function MemberProfile({
  member,
  onUpdate,
}: MemberProfileProps) {
  const t = useTranslations('member.profile');
  const tCommon = useTranslations('member.common');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [tiers, setTiers] = useState<MemberTier[]>([]);

  // Format date with null check
  const formattedJoinDate = member.joinDate
    ? format(new Date(member.joinDate), 'PPP')
    : 'Unknown';

  // Calculate membership duration with null check
  const membershipDuration = member.joinDate
    ? Math.floor(
        (Date.now() - new Date(member.joinDate).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  useEffect(() => {
    const fetchTiers = async () => {
      const result = await getAllMemberTiers();
      if (result.success && result.data) {
        setTiers(result.data);
      }
    };

    fetchTiers();
  }, []);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center">
            {t('title')}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <IconEdit size={16} />
              {t('editButton')}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Basic information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-muted-foreground text-xs">
                {t('fields.memberName')}
              </Label>
              <div id="name" className="font-medium text-lg">
                {member.name}
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs">
                {t('fields.contactInfo')}
              </Label>
              <div className="space-y-1 mt-1">
                {member.email && (
                  <div className="text-sm flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {member.email}
                  </div>
                )}
                {member.phone && (
                  <div className="text-sm flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {member.phone}
                  </div>
                )}
                {!member.email && !member.phone && (
                  <div className="text-sm italic text-muted-foreground">
                    {t('fields.noContactInfo')}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs mb-1 flex items-center">
                <IconClock size={14} className="mr-1" />
                {t('fields.memberSince')}
              </Label>
              <div className="text-sm">{formattedJoinDate}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {t('fields.membershipDuration', { days: membershipDuration })}
              </div>
            </div>

            {member.isBanned && (
              <div className="mt-4 p-3 rounded-md bg-red-50 border border-red-200">
                <div className="flex items-start gap-2">
                  <IconBan className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">
                      {t('banned.title')}
                    </h4>
                    {member.banReason && (
                      <p className="text-sm text-red-700 mt-1">
                        {member.banReason}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-red-300 hover:bg-red-50 text-red-700"
                      onClick={async () => {
                        try {
                          const result = await unbanMember(member.id);
                          if (result.success) {
                            toast({
                              title: t('banned.unbanSuccess'),
                              description: t('banned.unbanSuccessMessage', {
                                name: member.name,
                              }),
                            });
                            onUpdate?.();
                          } else {
                            toast({
                              title: tCommon('error'),
                              description:
                                result.error || t('banned.unbanFailed'),
                              variant: 'destructive',
                            });
                          }
                        } catch (error) {
                          console.error('Failed to unban member:', error);
                          toast({
                            title: tCommon('error'),
                            description: tCommon('unexpectedError'),
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      <IconShieldCheck className="h-4 w-4 mr-2" />
                      {t('banned.removeBanButton')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Points and tier information */}
          <div>
            <div className="bg-card border rounded-lg p-4">
              <div className="text-muted-foreground text-xs mb-1">
                {t('tier.title')}
              </div>
              <div className="flex items-center mb-1 mt-1">
                {member.tier ? (
                  <MemberTierBadge tier={member.tier} className="text-sm" />
                ) : (
                  <Badge variant="outline">{t('tier.noTier')}</Badge>
                )}
              </div>
              {member.tier && (
                <div className="text-xs text-muted-foreground flex items-center mt-2">
                  <IconCrown size={14} className="mr-1 text-amber-500" />
                  {t('tier.pointsMultiplier', {
                    multiplier: member.tier.multiplier,
                  })}
                </div>
              )}

              <div className="mt-4 border-t pt-4">
                <div className="flex items-center mb-2">
                  <div className="text-muted-foreground text-xs">
                    {t('points.summary')}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm">{t('points.available')}</div>
                  <div className="font-bold text-lg">
                    {member.totalPoints?.toLocaleString() || 0}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {t('points.lifetime')}
                  </div>
                  <div className="text-muted-foreground">
                    {member.totalPointsEarned?.toLocaleString() || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity summary */}
          <div className="border rounded-lg p-4">
            <div className="text-muted-foreground text-xs mb-3">
              {t('activity.title')}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-sm">{t('activity.transactions')}</div>
                <Badge variant="secondary" className="font-normal">
                  {member.transactions.length}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm">{t('activity.pointHistory')}</div>
                <Badge variant="secondary" className="font-normal">
                  {member.memberPoints.length}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm">{t('activity.rewardClaims')}</div>
                <Badge variant="secondary" className="font-normal">
                  {member.rewardClaims.length}
                </Badge>
              </div>

              <div className="mt-4 pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-2">
                  {t('activity.lastActivity')}
                </div>
                <div className="text-sm">
                  {member.memberPoints.length > 0
                    ? format(new Date(member.memberPoints[0].dateEarned), 'PPp')
                    : t('activity.noRecentActivity')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Member edit dialog */}
      <MemberFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={member}
        tiers={tiers}
        onSuccess={onUpdate}
      />
    </Card>
  );
}
