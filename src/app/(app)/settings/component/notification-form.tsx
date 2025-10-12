'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { IconLoader2, IconNotification } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { NotificationType } from '@/lib/types/store';
import { getStore, updateStore } from '../action';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function NotificationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [notificationData, setNotificationData] =
    useState<NotificationType | null>(null);
  const getStoreData = async () => {
    try {
      setIsLoading(true);
      const response = await getStore('store.');
      if (response.success) {
        setNotificationData(response.data as NotificationType);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const onSave = async () => {
    let status = 'false';
    if (!notificationData) {
      toast({
        title: 'Error',
        description: 'No notification data to save.',
        variant: 'destructive',
      });
      return;
    }
    if (notificationData.notification_blastify_api.trim() === '') {
      status = 'false';
      toast({
        title: 'Disable Notifications',
        description:
          'API Key is required to enable notifications. Please provide a valid API Key.',
        variant: 'destructive',
      });

      // return;
    }
    const data: NotificationType = {
      ...notificationData,
      notification_status: status,
    };
    try {
      setIsLoading(true);
      const response = await updateStore(data);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Notification settings updated successfully.',
        });
        setNotificationData({
          ...data,
          notification_status:
            data.notification_status === 'false' ? 'false' : 'true',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update notification settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const onChangeNotificationStatus = async () => {
    if (!notificationData) {
      toast({
        title: 'Error',
        description: 'No notification data to save.',
        variant: 'destructive',
      });
      return;
    }
    const data: NotificationType = {
      ...notificationData,
      notification_status:
        notificationData.notification_status === 'true' ? 'false' : 'true',
    };
    try {
      setIsLoading(true);
      const response = await updateStore(data);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Notification settings updated successfully.',
        });
      }
      setNotificationData(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update notification settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getStoreData();
  }, []);
  return (
    <Card className="w-full">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Notification Information</h2>
          <span className="text-xs text-muted-foreground flex items-center gap-2">
            {isLoading && <div>Loading...</div>}
            {isLoading && <IconLoader2 className="animate-spin" size={12} />}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              {isLoading ? (
                <IconLoader2 className="animate-spin" size={12} />
              ) : (
                <Button
                  variant={
                    notificationData?.notification_status === 'false'
                      ? 'destructive'
                      : 'default'
                  }
                  size={'sm'}
                >
                  <IconNotification size={12} />
                  {notificationData?.notification_status === 'false'
                    ? 'Disable Notifications'
                    : 'Enable Notifications'}
                </Button>
              )}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to{' '}
                  {notificationData?.notification_status ? 'disable' : 'enable'}{' '}
                  notifications?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action will{' '}
                  {notificationData?.notification_status ? 'disable' : 'enable'}{' '}
                  all notifications for your store. You can change this setting
                  later in the notification settings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onChangeNotificationStatus}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <CardContent className="space-y-6 pt-2">
        {notificationData?.notification_status === 'false' ? (
          <div>
            <div className="grid w-full max-w-sm items-center gap-3 mt-2">
              <Label htmlFor="email">Blastify API KEY</Label>
              <Input
                type="text"
                placeholder="Blastify API KEY"
                value={notificationData?.notification_blastify_api || ''}
                onChange={(e) =>
                  setNotificationData((prev) =>
                    prev
                      ? {
                          ...prev,
                          notification_blastify_api: e.target.value,
                        }
                      : null
                  )
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={
                  notificationData?.notification_status === 'false'
                    ? false
                    : true
                }
                className="mt-4"
                size={'sm'}
                onClick={onSave}
              >
                Save
                {isLoading && (
                  <IconLoader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground">
            Notifications are disabled
          </div>
        )}
      </CardContent>
    </Card>
  );
}
