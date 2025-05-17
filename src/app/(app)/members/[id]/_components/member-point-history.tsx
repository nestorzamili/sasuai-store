'use client';

import { MemberPointHistoryItem, MemberTier } from '@/lib/types/member';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { getAllMemberTiers } from '../../action';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/currency';

interface MemberPointHistoryProps {
  memberId: string;
  points: MemberPointHistoryItem[];
  memberTier?: MemberTier; // Updated type annotation
}

export default function MemberPointHistory({
  points,
  memberTier,
}: MemberPointHistoryProps) {
  const [tier, setTier] = useState(memberTier);

  useEffect(() => {
    if (!tier) {
      // Fetch tier information for this member if not provided
      const fetchMemberTier = async () => {
        try {
          const result = await getAllMemberTiers();
          if (result.success && result.data) {
            // Find tier for this member based on points
            const memberPoints = points.reduce(
              (sum, p) => sum + p.pointsEarned,
              0,
            );
            const appropriateTier = result.data.find(
              (t: MemberTier) => t.minPoints <= memberPoints,
            );
            if (appropriateTier) {
              setTier(appropriateTier);
            }
          }
        } catch (error) {
          console.error('Failed to fetch tier information', error);
        }
      };

      fetchMemberTier();
    }
  }, [tier, points]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Point History & Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {points.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {points.map((point) => {
                const isManualAward = point.transaction.id.startsWith('manual');
                const hasTransaction = !isManualAward && point.transaction;

                return (
                  <TableRow key={point.id}>
                    <TableCell>
                      {format(new Date(point.dateEarned), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      +{point.pointsEarned.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {isManualAward ? 'Manual award' : 'Transaction'}
                    </TableCell>
                    <TableCell>
                      {hasTransaction
                        ? formatRupiah(point.transaction.finalAmount)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {hasTransaction ? (
                        <Badge variant="outline" className="capitalize">
                          {point.transaction.paymentMethod}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{point.notes || '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No point history found for this member.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
