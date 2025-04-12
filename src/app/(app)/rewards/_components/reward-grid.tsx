import { RewardWithClaimCount } from '@/lib/types/reward';
import { RewardCard } from './reward-card';
import { Skeleton } from '@/components/ui/skeleton';

interface RewardGridProps {
  data: RewardWithClaimCount[];
  isLoading?: boolean;
  onEdit?: (reward: RewardWithClaimCount) => void;
  onDelete?: (reward: RewardWithClaimCount) => void;
}

export function RewardGrid({
  data,
  isLoading = false,
  onEdit,
  onDelete,
}: RewardGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <RewardCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No rewards found.</p>
      </div>
    );
  }

  // Separate rewards with and without images
  const rewardsWithImages = data.filter((reward) => reward.imageUrl);
  const rewardsWithoutImages = data.filter((reward) => !reward.imageUrl);

  return (
    <div className="space-y-8">
      {/* Rewards with images in a grid */}
      {rewardsWithImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rewardsWithImages.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Rewards without images in a more compact grid */}
      {rewardsWithoutImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rewardsWithoutImages.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RewardCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-full mb-6" />
        <div className="flex justify-between pt-2 border-t">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="p-4 border-t bg-muted/20 flex justify-end gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}
