'use client';

import { useState, useEffect } from 'react';
import { searchMembers, getAllMemberTiers } from '../action';
import { MemberWithTier } from '@/lib/types/member';
import MemberPrimaryButton from './member-primary-button';
import { MemberTable } from './member-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import TiersContent from './tiers-content';

export default function MainContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<MemberWithTier[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberWithTier | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState('members');
  const [tiers, setTiers] = useState<
    Array<{
      name: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      minPoints: number;
      multiplier: number;
    }>
  >([]);

  const fetchMembers = async (
    page = currentPage,
    limit = pageSize,
    query = searchQuery,
    sort = sortBy,
    direction = sortDirection,
  ) => {
    setIsLoading(true);
    try {
      const { data, success } = await searchMembers({
        query,
        page,
        limit,
        sortBy: sort,
        sortDirection: direction,
      });

      if (success && data) {
        setMembers(data.members);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch members',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch members',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTiers = async () => {
    try {
      const { data, success } = await getAllMemberTiers();
      if (success && data) {
        setTiers(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch member tiers',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchTiers();
  }, []);

  // Handle pagination change
  const handlePaginationChange = (page: number) => {
    fetchMembers(page, pageSize, searchQuery, sortBy, sortDirection);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchMembers(1, pageSize, query, sortBy, sortDirection);
  };

  // Handle sort
  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortBy(column);
    setSortDirection(direction);
    fetchMembers(currentPage, pageSize, searchQuery, column, direction);
  };

  // Handle dialog reset on close
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedMember(null);
    }
  };

  // Handle edit member
  const handleEdit = (member: MemberWithTier) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  // Handle member operation success
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedMember(null);
    fetchMembers();
    if (activeTab === 'tiers') {
      fetchTiers();
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'tiers') {
      fetchTiers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Membership Management
          </h2>
          <p className="text-muted-foreground">
            Manage your member data, loyalty tiers, and rewards.
          </p>
        </div>
        {activeTab === 'members' && (
          <MemberPrimaryButton
            open={isDialogOpen}
            onOpenChange={handleDialogOpenChange}
            initialData={selectedMember || undefined}
            tiers={tiers}
            onSuccess={handleSuccess}
          />
        )}
      </div>

      <Tabs
        defaultValue="members"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="tiers">Membership Tiers</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="mt-6">
          <MemberTable
            data={members}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefresh={() => fetchMembers()}
            onSearch={handleSearch}
            onSort={handleSort}
            onPaginate={handlePaginationChange}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
          />
        </TabsContent>
        <TabsContent value="tiers" className="mt-6">
          <TiersContent
            tiers={tiers}
            onSuccess={handleSuccess}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
