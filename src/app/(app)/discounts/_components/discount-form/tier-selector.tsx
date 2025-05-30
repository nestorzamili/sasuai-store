'use client';

import { useTranslations } from 'next-intl';
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
  const t = useTranslations('discount.form');

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
      <span>
        {t('minPoints')}: {tier.minPoints}
      </span>
      <span>
        {t('pointsMultiplier')}: {tier.multiplier}x
      </span>
    </>
  );

  // Define columns for the selected tiers table
  const tierColumns: Column<MemberTierForSelection>[] = [
    { header: t('tierName'), accessor: 'name' },
    {
      header: t('minPoints'),
      accessor: (tier: MemberTierForSelection) =>
        tier.minPoints.toLocaleString(),
    },
    {
      header: t('pointsMultiplier'),
      accessor: (tier: MemberTierForSelection) => `${tier.multiplier}x`,
    },
  ];

  return (
    <EntitySelector<MemberTierForSelection>
      selectedIds={selectedIds}
      onChange={onChange}
      fetchItems={fetchMemberTiers}
      renderItemDetails={renderTierDetails}
      placeholder={t('searchMemberTiers')}
      noSelectionText={t('noTiersSelected')}
      columns={tierColumns}
    />
  );
}
