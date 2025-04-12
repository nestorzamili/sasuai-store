'use client';

import { useState } from 'react';
import { IconShieldX, IconShieldCheck } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { User } from './main-content';
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

const banFormSchema = z.object({
  reason: z.string().min(1, 'Ban reason is required'),
  duration: z.string().optional(),
});

type BanFormValues = z.infer<typeof banFormSchema>;

export function UserBanDialog({ open, onOpenChange, user, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const isBanned = user.banned;

  const form = useForm<BanFormValues>({
    resolver: zodResolver(banFormSchema),
    defaultValues: {
      reason: '',
      duration: 'permanent',
    },
  });

  const handleBanUser = async (values: BanFormValues) => {
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
          title: 'User banned',
          description: `${user.name} has been banned successfully`,
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to ban user',
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
      setLoading(false);
      onOpenChange(false);
    }
  };

  const handleUnbanUser = async () => {
    try {
      setLoading(true);

      const result = await unbanUser({ userId: user.id });

      if (result.success) {
        toast({
          title: 'User unbanned',
          description: `${user.name} has been unbanned successfully`,
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to unban user',
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
      setLoading(false);
      onOpenChange(false);
    }
  };

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
            Unban User
          </span>
        }
        desc={
          <div className="space-y-4">
            <p className="mb-2">
              Are you sure you want to unban{' '}
              <span className="font-bold">{user.name}</span>?
            </p>

            <Alert>
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                Unbanning this user will restore their access to the system.
              </AlertDescription>
            </Alert>

            {user.banReason && (
              <div className="text-sm">
                <div className="font-semibold">Original Ban Reason:</div>
                <div className="mt-1 italic">{user.banReason}</div>
              </div>
            )}
          </div>
        }
        confirmText={loading ? 'Unbanning...' : 'Unban User'}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <IconShieldX className="mr-2 stroke-destructive" size={18} />
            Ban User
          </DialogTitle>
          <DialogDescription>
            Banning {user.name} will prevent them from accessing the system.
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
                  <FormLabel>Ban Reason</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter reason for ban" {...field} />
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
                  <FormLabel>Ban Duration</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ban duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="1d">1 Day</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert variant="destructive">
              <AlertTitle>Warning!</AlertTitle>
              <AlertDescription>
                Banning this user will prevent them from accessing the system.
                They will be automatically logged out of all active sessions.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={loading}>
                {loading ? 'Banning...' : 'Ban User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
