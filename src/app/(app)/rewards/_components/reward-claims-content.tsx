'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllRewardClaims } from '../actions';
import { RewardClaimsTable } from './reward-claims-table';
import { toast } from '@/hooks/use-toast';
import { IconSearch, IconX } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RewardClaimsContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [claims, setClaims] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch claims with search and filters
  const fetchClaims = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAllRewardClaims({
        search: searchQuery,
        status: statusFilter === 'all' ? '' : statusFilter,
      });

      if (result.success && result.data) {
        setClaims(result.data.claims);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch reward claims',
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
  }, [searchQuery, statusFilter]);

  // Initial fetch
  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // Handle status filter
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search Input */}
        <div className="relative w-full max-w-sm">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
          <Input
            placeholder="Search claims..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 px-2.5"
              onClick={handleClearSearch}
            >
              <IconX className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Claimed">Claimed</SelectItem>
            <SelectItem value="Fulfilled">Fulfilled</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Simplified table with DataTablePagination */}
      <RewardClaimsTable
        data={claims}
        isLoading={isLoading}
        onStatusChange={handleStatusChange}
        onRefresh={fetchClaims}
      />
    </div>
  );
}
