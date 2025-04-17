'use client';

import { useState } from 'react';
import { RewardWithClaimCount } from '@/lib/types/reward';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  IconLayoutGrid,
  IconList,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { RewardGrid } from './reward-grid';
import { RewardTable } from './reward-table';

interface RewardListViewProps {
  rewards: RewardWithClaimCount[];
  isLoading: boolean;
  onEdit: (reward: RewardWithClaimCount) => void;
  onDelete: (reward: RewardWithClaimCount) => void;
  onRefresh: () => void;
}

export function RewardListView({
  rewards,
  isLoading,
  onEdit,
  onDelete,
  onRefresh,
}: RewardListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className={`${viewMode === 'table' ? 'space-y-2' : 'space-y-4'}`}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Input - only shown in grid view */}
        {viewMode === 'grid' ? (
          <div className="relative w-full max-w-sm">
            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
            <Input
              placeholder="Search rewards..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9 pr-10"
              disabled={isLoading}
            />
            {searchTerm && (
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
        ) : (
          <div className="flex-1 h-0 sm:h-auto">
            {/* Empty div with reduced height in table mode */}
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex gap-2 ml-auto sm:ml-0">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            disabled={isLoading}
          >
            <IconLayoutGrid className="h-4 w-4 mr-1" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
            disabled={isLoading}
          >
            <IconList className="h-4 w-4 mr-1" />
            Table
          </Button>
        </div>
      </div>

      {/* Reward Display */}
      {viewMode === 'grid' ? (
        <RewardGrid
          data={rewards.filter((reward) =>
            searchTerm
              ? reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (reward.description &&
                  reward.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()))
              : true,
          )}
          isLoading={isLoading}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <div className="mt-0">
          <RewardTable
            isLoading={isLoading}
            onEdit={onEdit}
            onDelete={onDelete}
            onRefresh={onRefresh}
          />
        </div>
      )}
    </div>
  );
}
