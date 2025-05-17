import { MemberTier } from '@/lib/types/member';
import { Badge } from '@/components/ui/badge';

interface MemberTierBadgeProps {
  tier: MemberTier | null;
  className?: string;
}

export function MemberTierBadge({
  tier,
  className = '',
}: MemberTierBadgeProps) {
  if (!tier) {
    return (
      <Badge variant="outline" className={`text-xs ${className}`}>
        No Tier
      </Badge>
    );
  }

  // Determine badge variant based on tier name
  const tierName = tier.name.toLowerCase();
  let badgeClasses = '';

  if (tierName.includes('bronze')) {
    // Bronze - warm brown
    badgeClasses = 'bg-amber-800 text-white hover:bg-amber-900';
  } else if (tierName.includes('silver')) {
    // Silver - silvery gray
    badgeClasses = 'bg-gray-400 text-black hover:bg-gray-500';
  } else if (tierName.includes('gold')) {
    // Gold - rich gold color
    badgeClasses = 'bg-yellow-500 text-black hover:bg-yellow-600';
  } else if (tierName.includes('platinum')) {
    // Platinum - blue-tinted silver
    badgeClasses = 'bg-blue-300 text-blue-950 hover:bg-blue-400';
  } else if (tierName.includes('diamond')) {
    // Diamond - bright cyan/diamond blue
    badgeClasses = 'bg-cyan-500 text-white hover:bg-cyan-600';
  }

  return <Badge className={`${badgeClasses} ${className}`}>{tier.name}</Badge>;
}
