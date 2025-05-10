'use client';

import { useState, useEffect } from 'react';
import { MemberWithRelations } from '@/lib/types/member';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { MemberTierBadge } from '../../_components/member-tier-badge';
import { IconEdit, IconCrown, IconClock } from '@tabler/icons-react';
import MemberFormDialog from '../../_components/member-form-dialog';
import { getAllMemberTiers } from '../../action';
import { Badge } from '@/components/ui/badge';

interface MemberProfileProps {
  member: MemberWithRelations;
  onUpdate: () => void;
}

export default function MemberProfile({
  member,
  onUpdate,
}: MemberProfileProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [tiers, setTiers] = useState<any[]>([]);

  // Format date
  const formattedJoinDate = format(new Date(member.joinDate), 'PPP');
  const membershipDuration = Math.floor(
    (Date.now() - new Date(member.joinDate).getTime()) / (1000 * 60 * 60 * 24),
  );

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
            Member Profile
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <IconEdit size={16} />
              Edit
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
                Member Name
              </Label>
              <div id="name" className="font-medium text-lg">
                {member.name}
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs">
                Contact Information
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
                    No contact information provided
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground text-xs mb-1 flex items-center">
                <IconClock size={14} className="mr-1" />
                Member Since
              </Label>
              <div className="text-sm">{formattedJoinDate}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {membershipDuration} days as member
              </div>
            </div>
          </div>

          {/* Points and tier information */}
          <div>
            <div className="bg-card border rounded-lg p-4">
              <div className="text-muted-foreground text-xs mb-1">
                Membership Tier
              </div>
              <div className="flex items-center mb-1 mt-1">
                {member.tier ? (
                  <MemberTierBadge tier={member.tier} className="text-sm" />
                ) : (
                  <Badge variant="outline">No Tier</Badge>
                )}
              </div>
              {member.tier && (
                <div className="text-xs text-muted-foreground flex items-center mt-2">
                  <IconCrown size={14} className="mr-1 text-amber-500" />
                  Points multiplier: {member.tier.multiplier}x
                </div>
              )}

              <div className="mt-4 border-t pt-4">
                <div className="flex items-center mb-2">
                  <div className="text-muted-foreground text-xs">
                    Points Summary
                  </div>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm">Available Points</div>
                  <div className="font-bold text-lg">
                    {member.totalPoints.toLocaleString()}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Lifetime Points
                  </div>
                  <div className="text-muted-foreground">
                    {member.totalPointsEarned.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity summary */}
          <div className="border rounded-lg p-4">
            <div className="text-muted-foreground text-xs mb-3">
              Activity Summary
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-sm">Transactions</div>
                <Badge variant="secondary" className="font-normal">
                  {member.transactions.length}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm">Point History</div>
                <Badge variant="secondary" className="font-normal">
                  {member.memberPoints.length}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm">Reward Claims</div>
                <Badge variant="secondary" className="font-normal">
                  {member.rewardClaims.length}
                </Badge>
              </div>

              <div className="mt-4 pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-2">
                  Last activity
                </div>
                <div className="text-sm">
                  {member.memberPoints.length > 0
                    ? format(new Date(member.memberPoints[0].dateEarned), 'PPp')
                    : 'No recent activity'}
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
