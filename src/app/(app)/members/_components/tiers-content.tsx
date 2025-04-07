'use client';

import { useState, useMemo } from 'react';
import { MemberTier } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import TierFormDialog from './tier-form-dialog';
import TierDeleteDialog from './tier-delete-dialog';
import { IconEdit, IconTrash, IconPlus, IconCrown } from '@tabler/icons-react';

// Color themes for different tier ranks
const TIER_STYLES = {
  bronze: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-300 dark:border-amber-800',
    accent: 'bg-amber-600',
  },
  silver: {
    bg: 'bg-slate-50 dark:bg-slate-950',
    border: 'border-slate-300 dark:border-slate-700',
    accent: 'bg-slate-400',
  },
  gold: {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-yellow-300 dark:border-yellow-700',
    accent: 'bg-yellow-500',
  },
  platinum: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-300 dark:border-blue-700',
    accent: 'bg-blue-500',
  },
  diamond: {
    bg: 'bg-cyan-50 dark:bg-cyan-950',
    border: 'border-cyan-300 dark:border-cyan-700',
    accent: 'bg-cyan-500',
  },
};

// Map tier names to specific styles
const getTierStyle = (tier: MemberTier, index: number) => {
  const tierName = tier.name.toLowerCase();

  if (tierName.includes('bronze')) return TIER_STYLES.bronze;
  if (tierName.includes('silver')) return TIER_STYLES.silver;
  if (tierName.includes('gold')) return TIER_STYLES.gold;
  if (tierName.includes('platinum')) return TIER_STYLES.platinum;
  if (tierName.includes('diamond')) return TIER_STYLES.diamond;

  // Use default styles with a customized color based on multiplier
  const hue = Math.min(200 + tier.multiplier * 30, 340);
  return {
    bg: `bg-[hsl(${hue},80%,97%)] dark:bg-[hsl(${hue},30%,15%)]`,
    border: `border-[hsl(${hue},60%,80%)] dark:border-[hsl(${hue},40%,30%)]`,
    accent: `bg-[hsl(${hue},70%,50%)]`,
  };
};

interface TiersContentProps {
  tiers: MemberTier[];
  onSuccess?: () => void;
  isLoading?: boolean;
}

export default function TiersContent({
  tiers,
  onSuccess,
  isLoading,
}: TiersContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<MemberTier | null>(null);

  // Sort tiers by min points
  const sortedTiers = useMemo(
    () => [...tiers].sort((a, b) => a.minPoints - b.minPoints),
    [tiers],
  );

  // Handler functions
  const handleCreate = () => {
    setSelectedTier(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (tier: MemberTier) => {
    setSelectedTier(tier);
    setIsDialogOpen(true);
  };

  const handleDelete = (tier: MemberTier) => {
    setSelectedTier(tier);
    setIsDeleteDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setSelectedTier(null);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedTier(null);
    onSuccess?.();
  };

  if (isLoading) return <TiersContentSkeleton />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold flex items-center">
            <IconCrown className="w-5 h-5 mr-2 text-amber-500" />
            Membership Tiers
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure the membership tiers for your loyalty program
          </p>
        </div>
        <Button onClick={handleCreate} className="shadow-sm">
          <IconPlus className="w-4 h-4 mr-2" /> Create New Tier
        </Button>
      </div>

      {/* Empty state or tier cards */}
      {tiers.length === 0 ? (
        <EmptyTierState onCreate={handleCreate} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTiers.map((tier, index) => (
            <TierCard
              key={tier.id}
              tier={tier}
              index={index}
              isHighest={index === sortedTiers.length - 1}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <TierFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        initialData={selectedTier || undefined}
        onSuccess={handleSuccess}
      />

      {selectedTier && (
        <TierDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          tier={selectedTier}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

// Empty state component
function EmptyTierState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border rounded-xl bg-muted/30 border-dashed">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <IconCrown className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No tiers defined yet</h3>
      <p className="text-center text-muted-foreground mb-6 max-w-md">
        Create your first membership tier to kickstart your loyalty program and
        reward your members
      </p>
      <Button onClick={onCreate} size="lg" className="shadow-sm">
        <IconPlus className="w-4 h-4 mr-2" /> Create First Tier
      </Button>
    </div>
  );
}

// Tier card component
function TierCard({
  tier,
  index,
  isHighest,
  onEdit,
  onDelete,
}: {
  tier: MemberTier;
  index: number;
  isHighest: boolean;
  onEdit: (tier: MemberTier) => void;
  onDelete: (tier: MemberTier) => void;
}) {
  const colors = getTierStyle(tier, index);

  return (
    <Card
      className={`relative overflow-hidden border-2 ${colors.border} ${colors.bg} transition-all duration-200`}
    >
      {isHighest && (
        <div className="absolute top-0 right-0">
          <div className="bg-amber-500 text-white text-xs px-4 py-1 translate-x-5 translate-y-3 rotate-45 font-semibold">
            TOP TIER
          </div>
        </div>
      )}
      <div className={`absolute top-0 left-0 h-2 w-full ${colors.accent}`} />
      <CardHeader className="pb-2 pt-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            {tier.name}
            {isHighest && <IconCrown className="h-4 w-4 ml-2 text-amber-500" />}
          </CardTitle>
          <Badge variant="secondary" className="font-medium px-3 py-1">
            {tier.multiplier}x points
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-bold mb-2">
          {tier.minPoints.toLocaleString()}+
        </div>
        <p className="text-sm text-muted-foreground">
          Min. points required for this tier
        </p>

        <div className="mt-4 pt-4 border-t">
          <div className="text-sm">
            <div className="flex justify-between mb-2">
              <span>Points multiplier:</span>
              <span className="font-medium">{tier.multiplier}x</span>
            </div>
            <div className="flex justify-between">
              <span>Tier level:</span>
              <span className="font-medium">{index + 1}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2 border-t bg-black/5 dark:bg-white/5">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(tier)}
          className="hover:bg-black/10 dark:hover:bg-white/10"
        >
          <IconEdit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(tier)}
        >
          <IconTrash className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

// Simplified skeleton component
function TiersContentSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-5 w-80 mt-2" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card
            key={i}
            className="relative overflow-hidden border-2 border-muted bg-muted/20"
          >
            <div className="absolute top-0 left-0 h-2 w-full bg-muted" />
            <CardHeader className="pb-2 pt-6">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <Skeleton className="h-8 w-36 mb-2" />
              <Skeleton className="h-4 w-48" />
              <div className="mt-4 pt-4 border-t">
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-full" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2 border-t bg-black/5 dark:bg-white/5">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
