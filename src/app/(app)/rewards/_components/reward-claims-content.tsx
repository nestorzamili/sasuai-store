'use client';

import { useState, useEffect } from 'react';
import { getAllRewardClaims } from '../actions';
import { RewardClaimsTable } from './reward-claims-table';
import { toast } from '@/hooks/use-toast';

export default function RewardClaimsContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [claims, setClaims] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch claims with current pagination and filters
  const fetchClaims = async () => {
    setIsLoading(true);
    try {
      const result = await getAllRewardClaims({
        page: pageIndex + 1,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter,
      });

      if (result.success && result.data) {
        setClaims(result.data.claims);
        setTotalCount(result.data.totalCount);
        setPageCount(result.data.totalPages);
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
  };

  // Initial fetch
  useEffect(() => {
    fetchClaims();
  }, [pageIndex, pageSize, searchQuery, statusFilter]);

  // Handle pagination change
  const handlePaginationChange = (page: number, size: number) => {
    setPageIndex(page);
    if (size !== pageSize) {
      setPageSize(size);
    }
  };

  // Handle search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPageIndex(0); // Reset to first page on search
  };

  // Handle status filter
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPageIndex(0); // Reset to first page on filter change
  };

  return (
    <div className="space-y-4">
      <RewardClaimsTable
        data={claims}
        totalCount={totalCount}
        pageCount={pageCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        isLoading={isLoading}
        onPaginationChange={handlePaginationChange}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
