'use client';

import { useState } from 'react';
import { MemberWithRelations } from '@/lib/types/member';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconEdit, IconUser, IconMail, IconPhone } from '@tabler/icons-react';
import { format } from 'date-fns';
import { MemberTierBadge } from '../../_components/member-tier-badge';
import MemberFormDialog from '../../_components/member-form-dialog';
import { getAllMemberTiers } from '../../action';
import { useEffect } from 'react';

interface MemberProfileProps {
  member: MemberWithRelations;
  onUpdate: () => void;
}

export default function MemberProfile({
  member,
  onUpdate,
}: MemberProfileProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tiers, setTiers] = useState<any[]>([]);

  // Fetch the tiers when needed
  const fetchTiers = async () => {
    try {
      const result = await getAllMemberTiers();
      if (result.success && result.data) {
        setTiers(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch member tiers:', error);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      fetchTiers();
    }
  }, [isDialogOpen]);

  return (
    <>
      <Card className="relative">
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4"
          onClick={() => setIsDialogOpen(true)}
        >
          <IconEdit className="mr-2 h-4 w-4" /> Edit Member
        </Button>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-xl font-semibold mb-4">{member.name}</h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <IconUser size={16} className="mr-2 text-muted-foreground" />
                  <span>
                    Member since{' '}
                    {format(new Date(member.joinDate), 'MMMM d, yyyy')}
                  </span>
                </div>

                {member.email && (
                  <div className="flex items-center text-sm">
                    <IconMail
                      size={16}
                      className="mr-2 text-muted-foreground"
                    />
                    <span>{member.email}</span>
                  </div>
                )}

                {member.phone && (
                  <div className="flex items-center text-sm">
                    <IconPhone
                      size={16}
                      className="mr-2 text-muted-foreground"
                    />
                    <span>{member.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Membership Details */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Membership Tier
              </h4>
              {member.tier ? (
                <MemberTierBadge tier={member.tier} className="mb-4" />
              ) : (
                <Badge variant="outline" className="mb-4">
                  No Tier
                </Badge>
              )}

              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Points Balance
              </h4>
              <div className="text-2xl font-semibold">
                {member.totalPoints.toLocaleString()} points
              </div>

              {member.tier && (
                <div className="text-sm text-muted-foreground mt-1">
                  {member.tier.multiplier}x point multiplier
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Total Transactions
                </h4>
                <div className="text-lg font-medium">
                  {member.transactions.length}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Total Rewards Claimed
                </h4>
                <div className="text-lg font-medium">
                  {member.rewardClaims.length}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Total Points Earned
                </h4>
                <div className="text-lg font-medium">
                  {member.memberPoints
                    .reduce((total, point) => total + point.pointsEarned, 0)
                    .toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Using MemberFormDialog component with editing mode */}
      <MemberFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={member}
        tiers={tiers}
        onSuccess={onUpdate}
      />
    </>
  );
}
