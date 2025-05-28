'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { User, UserSession } from '@/lib/types/user';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  getUserSessions,
  revokeUserSession,
  revokeAllUserSessions,
} from '../action';
import {
  IconDevices,
  IconLoader2,
  IconX,
  IconRefresh,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSuccess?: () => void;
}

export function UserSessionsDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getUserSessions({ userId: user.id });

      if (result.success && result.sessions) {
        setSessions(result.sessions);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch sessions',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (open) {
      fetchSessions();
    }
  }, [open, fetchSessions]);

  const handleRevokeSession = useCallback(
    async (sessionToken: string) => {
      try {
        setRevokingSession(sessionToken);
        const result = await revokeUserSession({ sessionToken });

        if (result.success) {
          toast({
            title: 'Session revoked',
            description: 'The user session has been terminated successfully',
          });
          fetchSessions();
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to revoke session',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error revoking session:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      } finally {
        setRevokingSession(null);
      }
    },
    [fetchSessions],
  );

  const handleRevokeAllSessions = useCallback(async () => {
    try {
      setRevokingAll(true);
      const result = await revokeAllUserSessions({ userId: user.id });

      if (result.success) {
        toast({
          title: 'All sessions revoked',
          description: 'All user sessions have been terminated successfully',
        });
        fetchSessions();
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to revoke all sessions',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setRevokingAll(false);
    }
  }, [user.id, fetchSessions, onSuccess]);

  const getBrowserIcon = useCallback((userAgent?: string | null) => {
    if (!userAgent) return '🌐';

    if (userAgent.includes('Chrome')) return '🌐';
    if (userAgent.includes('Firefox')) return '🦊';
    if (userAgent.includes('Safari')) return '🧭';
    if (userAgent.includes('Edge')) return '🌐';
    if (userAgent.includes('Opera')) return '🔴';
    return '🌐';
  }, []);

  const getDeviceIcon = useCallback((userAgent?: string | null) => {
    if (!userAgent) return '💻';

    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return '📱';
    if (userAgent.includes('Android')) return '📱';
    if (userAgent.includes('Windows')) return '💻';
    if (userAgent.includes('Mac')) return '💻';
    if (userAgent.includes('Linux')) return '💻';
    return '💻';
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <IconDevices className="mr-2" size={18} />
            Manage User Sessions
          </DialogTitle>
          <DialogDescription>
            View and manage active sessions for {user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-muted-foreground">
            {sessions.length} active{' '}
            {sessions.length === 1 ? 'session' : 'sessions'}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSessions}
              disabled={loading}
            >
              <IconRefresh
                size={16}
                className={loading ? 'animate-spin' : ''}
              />
              <span className="ml-1">Refresh</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRevokeAllSessions}
              disabled={loading || revokingAll || sessions.length === 0}
            >
              {revokingAll ? (
                <IconLoader2 size={16} className="mr-1 animate-spin" />
              ) : (
                <IconX size={16} className="mr-1" />
              )}
              <span>Revoke All</span>
            </Button>
          </div>
        </div>

        {/* Always use ScrollArea, with different content based on loading state */}
        <ScrollArea className="flex-1 border rounded-md p-1">
          {loading ? (
            <div className="space-y-3 p-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 h-full flex items-center justify-center">
              <Alert>
                <AlertDescription>
                  No active sessions found for this user.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-3 p-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-lg">
                      {getDeviceIcon(session.userAgent)}
                    </div>
                    <div>
                      <div className="font-medium flex items-center">
                        {getBrowserIcon(session.userAgent)}
                        {session.userAgent?.split(' ').slice(0, 3).join(' ') ||
                          'Unknown browser'}
                        {session.current && (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.ipAddress || 'Unknown IP'} · Active{' '}
                        {session.lastActiveAt
                          ? formatDistanceToNow(
                              new Date(session.lastActiveAt),
                              { addSuffix: true },
                            )
                          : formatDistanceToNow(new Date(session.createdAt), {
                              addSuffix: true,
                            })}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(session.sessionToken)}
                    disabled={
                      revokingSession === session.sessionToken ||
                      session.current
                    }
                  >
                    {revokingSession === session.sessionToken ? (
                      <IconLoader2 size={16} className="animate-spin" />
                    ) : (
                      'Revoke'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
