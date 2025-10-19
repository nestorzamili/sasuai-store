'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useMemo } from 'react';
import { IconLoader2, IconNotification } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { NotificationType } from '@/lib/types/store';
import { getStore, updateStore, testNotification } from '../action';
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
  const [originalApiKey, setOriginalApiKey] = useState('');

  // Check if data has changed
  const hasChanges = useMemo(() => {
    if (!notificationData) return false;
    return notificationData.notification_blastify_api !== originalApiKey;
  }, [notificationData?.notification_blastify_api, originalApiKey]);

  const getStoreData = async () => {
    try {
      setIsLoading(true);
      const response = await getStore('store.');
      if (response.success) {
        const data = response.data as NotificationType;
        setNotificationData(data);
        setOriginalApiKey(data.notification_blastify_api || '');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to load notification settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSave = async () => {
    if (!notificationData) {
      toast({
        title: 'Error',
        description: 'No notification data to save.',
        variant: 'destructive',
      });
      return;
    }

    if (notificationData.notification_blastify_api.trim() === '') {
      toast({
        title: 'Error',
        description: 'API Key is required. Please provide a valid API Key.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await updateStore(notificationData);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Notification settings saved successfully.',
        });
        setOriginalApiKey(notificationData.notification_blastify_api);
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
        description: 'No notification data available.',
        variant: 'destructive',
      });
      return;
    }

    const newStatus =
      notificationData.notification_status === 'true' ? 'false' : 'true';

    // Validate API key when enabling notifications
    if (
      newStatus === 'true' &&
      notificationData.notification_blastify_api.trim() === ''
    ) {
      toast({
        title: 'Cannot Enable Notifications',
        description:
          'API Key is required to enable notifications. Please provide a valid API Key first.',
        variant: 'destructive',
      });
      return;
    }

    const data: NotificationType = {
      ...notificationData,
      notification_status: newStatus,
    };

    try {
      setIsLoading(true);
      const response = await updateStore(data);
      if (response.success) {
        toast({
          title: 'Success',
          description: `Notifications ${newStatus === 'true' ? 'enabled' : 'disabled'} successfully.`,
        });
        setNotificationData(data);
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

  const onTestNotification = async () => {
    if (!notificationData) {
      toast({
        title: 'Error',
        description: 'No notification data available.',
        variant: 'destructive',
      });
      return;
    }

    if (notificationData.notification_blastify_api.trim() === '') {
      toast({
        title: 'Error',
        description: 'API Key is required to send test notification.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Only update notification_status if needed
      if (notificationData.notification_status !== 'true') {
        const statusUpdateData: NotificationType = {
          ...notificationData,
          notification_status: 'true',
        };

        const updateResponse = await updateStore(statusUpdateData);
        if (updateResponse.success) {
          setNotificationData(statusUpdateData);
        }
      }

      const response = await testNotification();
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Test notification sent successfully.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to send test notification.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getStoreData();
  }, []);

  const isNotificationEnabled =
    notificationData?.notification_status === 'true';

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Notification Information</h2>
          {isLoading && (
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <span>Loading...</span>
              <IconLoader2 className="animate-spin" size={12} />
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={isNotificationEnabled ? 'destructive' : 'default'}
                size="sm"
                disabled={isLoading}
              >
                <IconNotification size={12} className="mr-2" />
                {isNotificationEnabled
                  ? 'Disable Notifications'
                  : 'Enable Notifications'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to{' '}
                  {isNotificationEnabled ? 'disable' : 'enable'} notifications?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action will{' '}
                  {isNotificationEnabled ? 'disable' : 'enable'} all
                  notifications for your store. You can change this setting
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
      <CardContent className="space-y-6 pt-6">
        {isNotificationEnabled ? (
          <div>
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="blastify-api">Blastify API KEY</Label>
              <Input
                id="blastify-api"
                type="text"
                placeholder="Enter your Blastify API KEY"
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
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                size="sm"
                onClick={onSave}
                disabled={isLoading || !hasChanges}
              >
                Save
                {isLoading && (
                  <IconLoader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onTestNotification}
                variant="outline"
                disabled={isLoading}
              >
                Test Notification
                {isLoading && (
                  <IconLoader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            Notifications are currently disabled. Enable notifications to
            configure settings.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
