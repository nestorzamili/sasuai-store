'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { MemberWithTier } from '@/lib/types/member';
import { searchMembers } from '../../members/action';
import { ComboBox } from '@/components/ui/combobox';
import { MemberTierBadge } from '../../members/_components/member-tier-badge';
import { IconUserPlus } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface MemberSearchProps {
  onSelect: (member: MemberWithTier | null) => void;
  selectedMember: MemberWithTier | null;
}

export function MemberSearch({ onSelect, selectedMember }: MemberSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<MemberWithTier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Perform search when query changes
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await searchMembers({
        query,
        page: 1,
        limit: 20,
      });

      if (response.success && response.data) {
        setMembers(response.data.members);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error searching members:', error);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Format options for ComboBox
  const memberOptions = useMemo(() => {
    return members.map((member) => ({
      value: member.id,
      label: `${member.name}${member.phone ? ` • ${member.phone}` : ''}`,
      // Store the full member object as custom data
      data: member,
    }));
  }, [members]);

  // Custom render function for selected value
  const renderSelectedValue = useCallback(() => {
    if (!selectedMember) return 'Select a member...';

    return (
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="truncate">{selectedMember.name}</span>
        {selectedMember.tier && <MemberTierBadge tier={selectedMember.tier} />}
      </div>
    );
  }, [selectedMember]);

  // Handle selection
  const handleSelectMember = useCallback(
    (memberId: string) => {
      if (!memberId) {
        onSelect(null);
        return;
      }

      const selectedMember = members.find((m) => m.id === memberId);
      if (selectedMember) {
        onSelect(selectedMember);
      }
    },
    [members, onSelect],
  );

  // Custom empty state component
  const emptyComponent = useMemo(
    () => (
      <div className="py-6 text-center text-sm">
        {hasSearched ? (
          <>
            <p>No members found</p>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => window.open('/members', '_blank')}
            >
              <IconUserPlus size={16} className="mr-1" />
              Add New Member
            </Button>
          </>
        ) : (
          <p>Type at least 2 characters to search</p>
        )}
      </div>
    ),
    [hasSearched],
  );

  return (
    <ComboBox
      options={memberOptions}
      value={selectedMember?.id || ''}
      onChange={handleSelectMember}
      placeholder="Search for a member..."
      customSearchFunction={performSearch}
      loadingState={isLoading}
      customSelectedRenderer={renderSelectedValue}
      customEmptyComponent={emptyComponent}
    />
  );
}
