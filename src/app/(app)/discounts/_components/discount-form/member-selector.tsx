'use client';

import { getMembersForSelection } from '../../action';
import EntitySelector from './entity-selector';

interface Member {
  id: string;
  name: string;
  tier?: {
    name: string;
  } | null;
  cardId?: string;
}

interface MemberSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function MemberSelector({
  selectedIds,
  onChange,
}: MemberSelectorProps) {
  const fetchMembers = async (
    search: string,
  ): Promise<{ success: boolean; data?: Member[] }> => {
    try {
      const response = await getMembersForSelection(search);
      if (response.success && response.members) {
        return {
          success: true,
          data: response.members,
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

  const renderMemberDetails = (member: Member) => (
    <>
      {member.tier && <span>{member.tier.name}</span>}
      {member.cardId && <span>Card: {member.cardId}</span>}
    </>
  );

  // Define columns for the selected members table
  const memberColumns = [
    { header: 'Member Name', accessor: 'name' },
    {
      header: 'Membership Tier',
      accessor: (member: Member) => member.tier?.name || 'N/A',
    },
    {
      header: 'Card ID',
      accessor: (member: Member) => member.cardId || 'N/A',
    },
  ];

  return (
    <EntitySelector<Member>
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
