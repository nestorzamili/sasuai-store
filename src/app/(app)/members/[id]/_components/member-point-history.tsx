'use client';

import { MemberPointHistoryItem } from '@/lib/types/member';
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
import { awardPointsToMember } from '../../action';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IconGift } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';

interface MemberPointHistoryProps {
  memberId: string;
  points: MemberPointHistoryItem[];
}

export default function MemberPointHistory({
  memberId,
  points,
}: MemberPointHistoryProps) {
  const [open, setOpen] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [pointNotes, setPointNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Format transaction ID to be shorter if needed
  const formatTransactionId = (id: string) => {
    return id.length > 8 ? id.substring(0, 8) + '...' : id;
  };

  // Handle manual points award
  const handleAddPoints = async () => {
    if (pointsToAdd <= 0) {
      toast({
        title: 'Invalid points',
        description: 'Please enter a positive number of points',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      const result = await awardPointsToMember(
        memberId,
        pointsToAdd,
        pointNotes,
      );

      if (result.success) {
        toast({
          title: 'Points added',
          description: `${pointsToAdd} points have been added to this member`,
        });
        setOpen(false);
        // Refresh the page to show the new points
        window.location.reload();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to add points',
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Point History</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <IconGift size={16} />
              Award Points
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Award Points</DialogTitle>
              <DialogDescription>
                Manually award points to this member.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="points" className="text-sm font-medium">
                    Points to Award
                  </label>
                  <Input
                    id="points"
                    type="number"
                    value={pointsToAdd}
                    onChange={(e) =>
                      setPointsToAdd(parseInt(e.target.value) || 0)
                    }
                    placeholder="Enter points"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notes (Optional)
                  </label>
                  <Textarea
                    id="notes"
                    value={pointNotes}
                    onChange={(e) => setPointNotes(e.target.value)}
                    placeholder="Enter a reason for awarding these points"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddPoints}
                disabled={isLoading || pointsToAdd <= 0}
              >
                {isLoading ? 'Adding...' : 'Add Points'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {points.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Points Earned</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {points.map((point) => (
                <TableRow key={point.id}>
                  <TableCell>
                    {format(new Date(point.dateEarned), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">
                    +{point.pointsEarned.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {point.transaction.id.startsWith('manual')
                      ? 'Manual award'
                      : formatTransactionId(point.transaction.id)}
                  </TableCell>
                  <TableCell>{point.notes || '-'}</TableCell>
                </TableRow>
              ))}
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
