'use client';

import { useState, useEffect } from 'react';
import { RewardClaimHistoryItem } from '@/lib/types/member';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IconGift } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { getMemberAvailableRewards, claimRewardForMember } from '../../action';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MemberRewardHistoryProps {
  memberId: string;
  claims: RewardClaimHistoryItem[];
}

export default function MemberRewardHistory({
  memberId,
  claims,
}: MemberRewardHistoryProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableRewards, setAvailableRewards] = useState<any[]>([]);
  const [selectedRewardId, setSelectedRewardId] = useState<string>('');

  // Fetch available rewards when dialog opens
  useEffect(() => {
    if (open) {
      fetchAvailableRewards();
    }
  }, [open]);

  const fetchAvailableRewards = async () => {
    setIsLoading(true);
    try {
      const result = await getMemberAvailableRewards(memberId);

      if (result.success && result.data) {
        setAvailableRewards(result.data);
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
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reward claim
  const handleClaimReward = async () => {
    if (!selectedRewardId) {
      toast({
        title: 'No reward selected',
        description: 'Please select a reward to claim',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await claimRewardForMember(memberId, selectedRewardId);

      if (result.success) {
        toast({
          title: 'Reward claimed',
          description: 'The reward has been successfully claimed',
        });
        setOpen(false);
        // Refresh the page to show the new claim
        window.location.reload();
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
      setIsLoading(false);
    }
  };

  // Get status badge for claim status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Claimed':
        return <Badge variant="secondary">Claimed</Badge>;
      case 'Fulfilled':
        return (
          <Badge
            variant="secondary"
            className="bg-green-500 hover:bg-green-600"
          >
            Fulfilled
          </Badge>
        );
      case 'Cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'Pending':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reward Claims</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <IconGift size={16} />
              Claim Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Claim Reward</DialogTitle>
              <DialogDescription>
                Select a reward for this member to claim.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                {isLoading ? (
                  <p>Loading available rewards...</p>
                ) : availableRewards.length > 0 ? (
                  <div className="space-y-2">
                    <label htmlFor="reward" className="text-sm font-medium">
                      Select Reward
                    </label>
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
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No rewards available for this member to claim. Either they
                    don't have enough points or there are no active rewards.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleClaimReward}
                disabled={
                  isLoading ||
                  !selectedRewardId ||
                  availableRewards.length === 0
                }
              >
                {isLoading ? 'Processing...' : 'Claim Reward'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {claims.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Points Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>
                    {format(new Date(claim.claimDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{claim.reward.name}</TableCell>
                  <TableCell>
                    {claim.reward.pointsCost.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(claim.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            This member hasn't claimed any rewards yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
