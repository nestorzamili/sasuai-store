import { RewardWithClaimCount } from '@/lib/types/reward';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IconTrophy, IconClock, IconGift } from '@tabler/icons-react';
import { format } from 'date-fns';

interface RewardCardProps {
  reward: RewardWithClaimCount;
  onEdit?: (reward: RewardWithClaimCount) => void;
  onDelete?: (reward: RewardWithClaimCount) => void;
}

export function RewardCard({ reward, onEdit, onDelete }: RewardCardProps) {
  const isExpired =
    reward.expiryDate && new Date(reward.expiryDate) < new Date();
  const isOutOfStock = reward.stock <= 0;
  const isUnavailable = !reward.isActive || isExpired || isOutOfStock;

  const getStatusBadge = () => {
    if (!reward.isActive) return <Badge variant="secondary">Inactive</Badge>;
    if (isExpired) return <Badge variant="destructive">Expired</Badge>;
    if (isOutOfStock) return <Badge variant="destructive">Out of Stock</Badge>;

    if (reward.expiryDate) {
      const daysToExpire = Math.ceil(
        (new Date(reward.expiryDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysToExpire <= 7) {
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            Expires in {daysToExpire} {daysToExpire === 1 ? 'day' : 'days'}
          </Badge>
        );
      }
    }

    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        Active
      </Badge>
    );
  };

  return (
    <Card className={`overflow-hidden ${isUnavailable ? 'opacity-70' : ''}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            <IconTrophy className="mr-2 h-4 w-4 text-yellow-500" />
            {reward.name}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="text-2xl font-bold mb-2">
          {reward.pointsCost} points
        </div>

        {reward.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {reward.description}
          </p>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center text-sm text-muted-foreground">
            <IconGift className="mr-1 h-4 w-4" />
            {reward.stock} in stock
          </div>

          {reward.expiryDate && (
            <div className="flex items-center text-sm text-muted-foreground">
              <IconClock className="mr-1 h-4 w-4" />
              {format(new Date(reward.expiryDate), 'MMM d, yyyy')}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2 border-t bg-muted/20">
        <Button size="sm" variant="ghost" onClick={() => onEdit?.(reward)}>
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10"
          onClick={() => onDelete?.(reward)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
