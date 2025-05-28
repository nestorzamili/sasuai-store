'use client';

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
      {member.cardId && <span>Card: {member.cardId}</span>}
    </>
  );

  // Define columns for the selected members table
  const memberColumns: Column<MemberForSelection>[] = [
    { header: 'Member Name', accessor: 'name' },
    {
      header: 'Membership Tier',
      accessor: (member: MemberForSelection) => member.tier?.name || 'N/A',
    },
    {
      header: 'Card ID',
      accessor: (member: MemberForSelection) => member.cardId || 'N/A',
    },
  ];

  return (
    <EntitySelector<MemberForSelection>
      selectedIds={selectedIds}
      onChange={onChange}
      fetchItems={fetchMembers}
      renderItemDetails={renderMemberDetails}
      placeholder="Search members..."
      noSelectionText="No members selected"
      columns={memberColumns}
    />
  );
}
