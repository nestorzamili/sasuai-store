import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { getTopMembers } from '../../actions';
import { DateFilter as FilterDateFilter } from '@/lib/types/filter';
import { TopMemberData } from '@/lib/types/dashboard';
import { LoaderCardContent } from '@/components/loader-card-content';
import { UnavailableData } from '@/components/unavailable-data';

interface TopMemberProps {
  filter?: FilterDateFilter;
}

export function TopMember({ filter }: TopMemberProps) {
  const [members, setMembers] = useState<TopMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoize the API filter to prevent unnecessary recreations
  const apiFilter = useMemo(() => {
    const defaultStart = new Date();
    defaultStart.setDate(1); // First day of current month
    const defaultEnd = new Date();
    const lastDay = new Date(
      defaultEnd.getFullYear(),
      defaultEnd.getMonth() + 1,
      0
    ).getDate();
    defaultEnd.setDate(lastDay); // Last day of current month

    return {
      filter: {
        from:
          filter?.from instanceof Date
            ? format(filter.from, 'yyyy-MM-dd')
            : filter?.from
              ? String(filter.from)
              : format(defaultStart, 'yyyy-MM-dd'),
        to:
          filter?.to instanceof Date
            ? format(filter.to, 'yyyy-MM-dd')
            : filter?.to
              ? String(filter.to)
              : format(defaultEnd, 'yyyy-MM-dd'),
      },
    };
  }, [filter?.from, filter?.to]);

  const fetchTopMembers = useCallback(async () => {
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);

      console.log('Sending filter to API:', apiFilter);
      const response = await getTopMembers(apiFilter);

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (response.success && response.data) {
        setMembers(response.data);
      } else {
        setMembers([]);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching top members:', error);
      }
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [apiFilter]);

  useEffect(() => {
    fetchTopMembers();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTopMembers]);
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Top Members</CardTitle>
        <CardDescription>Members with highest points earned</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-0 pb-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[250px]">
            <LoaderCardContent className="w-full h-full" />
          </div>
        ) : members.length === 0 ? (
          <UnavailableData
            title="No Member Data"
            description="No member data available for the selected date range."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Last Transaction</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {member.email || 'No email provided'}
                      </div>
                    </div>
                    {member.tier && (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200"
                      >
                        {member.tier.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.lastTransactionDate ? (
                      <div>
                        <div>
                          {format(
                            new Date(member.lastTransactionDate),
                            'dd MMM yyyy'
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(
                            new Date(member.lastTransactionDate),
                            'HH:mm'
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium">
                      {member.totalPointsEarned.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Current: {member.totalPoints.toLocaleString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
