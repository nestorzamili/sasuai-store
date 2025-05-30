'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { IconShieldX, IconShieldCheck } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { User } from '@/lib/types/user';
import { banUser, unbanUser } from '../action';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSuccess?: () => void;
}

const createBanFormSchema = (t) =>
  z.object({
    reason: z.string().min(1, t('reasonRequired')),
    duration: z.string().optional(),
  });

type BanFormValues = z.infer<ReturnType<typeof createBanFormSchema>>;

export function UserBanDialog({ open, onOpenChange, user, onSuccess }: Props) {
  const t = useTranslations('user.banDialog');
  const tCommon = useTranslations('user.common');
  const [loading, setLoading] = useState(false);
  const isBanned = user.banned;

  const form = useForm<BanFormValues>({
    resolver: zodResolver(createBanFormSchema(t)),
    defaultValues: {
      reason: '',
      duration: 'permanent',
    },
  });

  const handleBanUser = useCallback(
    async (values: BanFormValues) => {
      try {
        setLoading(true);

        // Calculate expiration date if not permanent
        let banExpiresIn: number | undefined = undefined;
        if (values.duration !== 'permanent') {
          if (values.duration === '1d') banExpiresIn = 60 * 60 * 24;
          if (values.duration === '7d') banExpiresIn = 60 * 60 * 24 * 7;
          if (values.duration === '30d') banExpiresIn = 60 * 60 * 24 * 30;
        }

        const result = await banUser({
          userId: user.id,
          banReason: values.reason,
          banExpiresIn,
        });

        if (result.success) {
          toast({
            title: t('banSuccess'),
            description: t('banSuccessMessage'),
          });
          onSuccess?.();
        } else {
          toast({
            title: tCommon('error'),
            description: result.error || t('error.failed'),
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error banning user:', error);
        toast({
          title: tCommon('error'),
          description: t('error.unexpected'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        onOpenChange(false);
      }
    },
    [user.id, onSuccess, onOpenChange, t, tCommon],
  );

  const handleUnbanUser = useCallback(async () => {
    try {
      setLoading(true);

      const result = await unbanUser({ userId: user.id });

      if (result.success) {
        toast({
          title: t('unbanSuccess'),
          description: t('unbanSuccessMessage'),
        });
        onSuccess?.();
      } else {
        toast({
          title: tCommon('error'),
          description: result.error || t('error.failed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: tCommon('error'),
        description: t('error.unexpected'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  }, [user.id, onSuccess, onOpenChange, t, tCommon]);

  if (isBanned) {
    return (
      <ConfirmDialog
        open={open}
        onOpenChange={onOpenChange}
        handleConfirm={handleUnbanUser}
        disabled={loading}
        title={
          <span className="flex items-center text-green-600">
            <IconShieldCheck className="mr-2 stroke-green-600" size={18} />
            {t('unbanTitle')}
          </span>
        }
        desc={
          <div className="space-y-4">
            <p className="mb-2">
              {t('unbanDescription')}{' '}
              <span className="font-bold">{user.name}</span>?
            </p>

            <Alert>
              <AlertTitle>{t('information')}</AlertTitle>
              <AlertDescription>{t('unbanInfo')}</AlertDescription>
            </Alert>

            {user.banReason && (
              <div className="text-sm">
                <div className="font-semibold">{t('originalBanReason')}:</div>
                <div className="mt-1 italic">{user.banReason}</div>
              </div>
            )}
          </div>
        }
        confirmText={loading ? t('unbanning') : t('unbanButton')}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <IconShieldX className="mr-2 stroke-destructive" size={18} />
            {t('banTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('banDescription', { name: user.name })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleBanUser)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reason')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('reasonPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('duration')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('durationPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="permanent">
                        {t('durations.permanent')}
                      </SelectItem>
                      <SelectItem value="1d">{t('durations.1d')}</SelectItem>
                      <SelectItem value="7d">{t('durations.7d')}</SelectItem>
                      <SelectItem value="30d">{t('durations.30d')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert variant="destructive">
              <AlertTitle>{t('warning')}</AlertTitle>
              <AlertDescription>{t('banWarning')}</AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                {tCommon('cancel')}
              </Button>
              <Button type="submit" variant="destructive" disabled={loading}>
                {loading ? t('banning') : t('banButton')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
