import { MemberWithTier } from '@/lib/types/member';

/**
 * Calculate points that a member would earn for a given transaction amount
 * @param amount The final transaction amount
 * @param member The member with tier information
 * @returns The number of points the member would earn
 */
export function calculateMemberPoints(
  amount: number,
  member: MemberWithTier | null,
): number {
  if (!member) return 0;

  // Base calculation (1 point per 1000 amount)
  const basePoints = Math.floor(amount / 1000);

  // Apply tier multiplier if available
  const multiplier = member.tier?.multiplier || 1;

  // Calculate and round down to nearest integer
  return Math.floor(basePoints * multiplier);
}

/**
 * Format member name with points display
 * @param member The member
 * @param includePoints Whether to include points in the formatted string
 * @returns Formatted member name string
 */
export function formatMemberInfo(
  member: MemberWithTier | null,
  includePoints: boolean = true,
): string {
  if (!member) return 'Guest';

  if (includePoints) {
    return `${member.name} (${member.totalPoints} pts)`;
  }

  return member.name;
}
