'use client';

import { useTranslations } from 'next-intl';

import { getMembersForSelection } from '../../action';
import EntitySelector from './entity-selector';
import {
  MemberForSelection,
  MemberSelectorProps,
  Column,
} from '@/lib/types/discount';

export default function MemberSelector({
  selectedIds,
  onChange,
}: MemberSelectorProps) {
  const t = useTranslations('discount.form');

  const fetchMembers = async (
    search: string,
  ): Promise<{ success: boolean; data?: MemberForSelection[] }> => {
    try {
      const response = await getMembersForSelection(search);
      if (response.success && response.members) {
        // Transform the response to match our interface
        const transformedMembers: MemberForSelection[] = response.members.map(
          (member) => ({
            id: member.id,
            name: member.name,
            tier: member.tier,
            cardId: member.cardId,
          }),
        );

        return {
          success: true,
          data: transformedMembers,
        };
      }
      return {
        success: false,
        data: [],
      };
    } catch (error) {
      console.error('Error fetching members:', error);
      return {
        success: false,
        data: [],
      };
    }
  };

  const renderMemberDetails = (member: MemberForSelection) => (
    <>
      {member.tier && <span>{member.tier.name}</span>}
      {member.cardId && (
        <span>
          {t('cardId')}: {member.cardId}
        </span>
      )}
    </>
  );

  // Define columns for the selected members table
  const memberColumns: Column<MemberForSelection>[] = [
    { header: t('memberName'), accessor: 'name' },
    {
      header: t('membershipTier'),
      accessor: (member: MemberForSelection) => member.tier?.name || 'N/A',
    },
    {
      header: t('cardId'),
      accessor: (member: MemberForSelection) => member.cardId || 'N/A',
    },
  ];

  return (
    <EntitySelector<MemberForSelection>
      selectedIds={selectedIds}
      onChange={onChange}
      fetchItems={fetchMembers}
      renderItemDetails={renderMemberDetails}
      placeholder={t('searchMembers')}
      noSelectionText={t('noMembersSelected')}
      columns={memberColumns}
    />
  );
}
