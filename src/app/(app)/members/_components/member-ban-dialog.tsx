'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { MemberWithTier } from '@/lib/types/member';
import { banMember } from '../action';
import { IconBan } from '@tabler/icons-react';

interface MemberBanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberWithTier;
  onSuccess?: () => void;
}

export function MemberBanDialog({
  open,
  onOpenChange,
  member,
  onSuccess,
}: MemberBanDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBan = async () => {
    if (!reason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for banning this member',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await banMember(member.id, reason);

      if (result.success) {
        toast({
          title: 'Member banned',
          description: `${member.name} has been banned successfully`,
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to ban member',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <IconBan size={18} />
            Ban Member
          </DialogTitle>
          <DialogDescription>
            You are about to ban {member.name}. This will prevent them from
            earning points, claiming rewards, or receiving discounts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Ban</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for banning this member..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              This reason will be recorded and may be shown to administrators.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleBan}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Banning...' : 'Ban Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
