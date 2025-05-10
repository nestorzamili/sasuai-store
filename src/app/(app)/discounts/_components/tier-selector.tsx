'use client';

import { getMemberTiersForSelection } from '../action';
import EntitySelector from './entity-selector';

interface MemberTier {
  id: string;
  name: string;
  minPoints: number;
  multiplier: number;
}

interface TierSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function TierSelector({
  selectedIds,
  onChange,
}: TierSelectorProps) {
  const fetchMemberTiers = async (
    search: string,
  ): Promise<{ success: boolean; data?: MemberTier[] }> => {
    try {
      const response = await getMemberTiersForSelection(search);
      if (response.success && response.tiers) {
        return {
          success: true,
          data: response.tiers,
        };
      }
      return {
        success: false,
        data: [],
      };
    } catch (error) {
      console.error('Error fetching member tiers:', error);
      return { success: false, data: [] };
    }
  };

  const renderTierDetails = (tier: MemberTier) => (
    <>
      <span>Min Points: {tier.minPoints}</span>
      <span>Multiplier: {tier.multiplier}x</span>
    </>
  );

  // Define columns for the selected tiers table
  const tierColumns = [
    { header: 'Tier Name', accessor: 'name' },
    {
      header: 'Min. Points',
      accessor: (tier: MemberTier) => tier.minPoints.toLocaleString(),
    },
    {
      header: 'Points Multiplier',
      accessor: (tier: MemberTier) => `${tier.multiplier}x`,
    },
  ];

  return (
    <EntitySelector<MemberTier>
      selectedIds={selectedIds}
      onChange={onChange}
      fetchItems={fetchMemberTiers}
      renderItemDetails={renderTierDetails}
      placeholder="Search member tiers..."
      noSelectionText="No member tiers selected"
      columns={tierColumns}
    />
  );
}
