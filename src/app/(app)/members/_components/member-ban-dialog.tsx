'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('member.banDialog');
  const tCommon = useTranslations('member.common');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBan = async () => {
    if (!reason.trim()) {
      toast({
        title: tCommon('error'),
        description: t('reasonRequired'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await banMember(member.id, reason);

      if (result.success) {
        toast({
          title: t('success'),
          description: t('successMessage', { name: member.name }),
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast({
          title: tCommon('error'),
          description: result.error || t('failed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to ban member:', error);
      toast({
        title: tCommon('error'),
        description: tCommon('unexpectedError'),
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
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description', { name: member.name })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">{t('reasonLabel')}</Label>
            <Textarea
              id="reason"
              placeholder={t('reasonPlaceholder')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">{t('reasonNote')}</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleBan}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('banning') : t('banButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
