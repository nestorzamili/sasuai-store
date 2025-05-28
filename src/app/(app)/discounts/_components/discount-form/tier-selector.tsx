'use client';

import { getMemberTiersForSelection } from '../../action';
import EntitySelector from './entity-selector';
import {
  MemberTierForSelection,
  TierSelectorProps,
  Column,
} from '@/lib/types/discount';

export default function TierSelector({
  selectedIds,
  onChange,
}: TierSelectorProps) {
  const fetchMemberTiers = async (
    search: string,
  ): Promise<{ success: boolean; data?: MemberTierForSelection[] }> => {
    try {
      const response = await getMemberTiersForSelection(search);
      if (response.success && response.tiers) {
        // Transform the response to match our interface
        const transformedTiers: MemberTierForSelection[] = response.tiers.map(
          (tier) => ({
            id: tier.id,
            name: tier.name,
            minPoints: tier.minPoints,
            multiplier: tier.multiplier,
          }),
        );

        return {
          success: true,
          data: transformedTiers,
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

  const renderTierDetails = (tier: MemberTierForSelection) => (
    <>
      <span>Min Points: {tier.minPoints}</span>
      <span>Multiplier: {tier.multiplier}x</span>
    </>
  );

  // Define columns for the selected tiers table
  const tierColumns: Column<MemberTierForSelection>[] = [
    { header: 'Tier Name', accessor: 'name' },
    {
      header: 'Min. Points',
      accessor: (tier: MemberTierForSelection) =>
        tier.minPoints.toLocaleString(),
    },
    {
      header: 'Points Multiplier',
      accessor: (tier: MemberTierForSelection) => `${tier.multiplier}x`,
    },
  ];

  return (
    <EntitySelector<MemberTierForSelection>
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
