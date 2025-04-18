'use client';

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

interface MemberRewardHistoryProps {
  memberId: string;
  claims: RewardClaimHistoryItem[];
}

export default function MemberRewardHistory({
  claims,
}: MemberRewardHistoryProps) {
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
      <CardHeader>
        <CardTitle>Reward Claims</CardTitle>
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
