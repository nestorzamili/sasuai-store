'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from '@/hooks/use-toast';
import { User, UserSession } from '@/lib/types/user';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
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
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconBrandWindows,
  IconBrandApple,
  IconBrandAndroid,
  IconWorld,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSuccess?: () => void;
}

// Enhanced user agent parser
interface ParsedUserAgent {
  appName: string;
  appVersion: string;
  platform: string;
  device: string;
  browser: string;
  os: string;
  isDesktop: boolean;
  isMobile: boolean;
  isTablet: boolean;
}

const parseUserAgent = (userAgent: string): ParsedUserAgent => {
  if (!userAgent) {
    return {
      appName: 'Unknown',
      appVersion: '',
      platform: 'Unknown',
      device: 'Unknown',
      browser: 'Unknown Browser',
      os: 'Unknown OS',
      isDesktop: false,
      isMobile: false,
      isTablet: false,
    };
  }

  // Check if it's a sasuai-store desktop app first
  const appMatch = userAgent.match(/^([^\/]+)\/([^\s]+)/);
  const isDesktopApp = appMatch && appMatch[1] === 'sasuai-store';

  if (isDesktopApp) {
    // Parse sasuai-store specific user agent format
    // Format: sasuai-store/1.6.2 (Windows_NT 10.0.26120; x64) Desktop/DESKTOP-PEK0CMN
    const osMatch = userAgent.match(/\(([^;]+);\s*([^)]+)\)/);
    const deviceMatch = userAgent.match(/\)\s*([^\/]+)(?:\/(.+))?$/);

    const appName = appMatch[1];
    const appVersion = appMatch[2];
    const osInfo = osMatch?.[1] || '';
    const architecture = osMatch?.[2] || '';
    const deviceType = deviceMatch?.[1] || '';
    const deviceName = deviceMatch?.[2] || '';

    // Determine OS
    let os = 'Unknown OS';
    if (osInfo.includes('Windows')) {
      os = `Windows ${osInfo.replace('Windows_NT', '').trim()}`;
    } else if (osInfo.includes('Darwin') || osInfo.includes('Mac')) {
      os = 'macOS';
    } else if (osInfo.includes('Linux')) {
      os = 'Linux';
    }

    return {
      appName,
      appVersion,
      platform: `${os} ${architecture}`.trim(),
      device: deviceName || deviceType || 'Desktop',
      browser: appName,
      os,
      isDesktop: true,
      isMobile: false,
      isTablet: false,
    };
  } else {
    // Parse web browser user agent
    let browser = 'Unknown Browser';
    let browserVersion = '';
    let os = 'Unknown OS';
    let device = 'Unknown Device';
    let isDesktop = false;
    let isMobile = false;
    let isTablet = false;

    // Detect browser
    if (userAgent.includes('Edg/')) {
      const match = userAgent.match(/Edg\/([0-9.]+)/);
      browser = 'Microsoft Edge';
      browserVersion = match?.[1] || '';
    } else if (userAgent.includes('Chrome/')) {
      const match = userAgent.match(/Chrome\/([0-9.]+)/);
      browser = 'Chrome';
      browserVersion = match?.[1] || '';
    } else if (userAgent.includes('Firefox/')) {
      const match = userAgent.match(/Firefox\/([0-9.]+)/);
      browser = 'Firefox';
      browserVersion = match?.[1] || '';
    } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
      const match = userAgent.match(/Version\/([0-9.]+)/);
      browser = 'Safari';
      browserVersion = match?.[1] || '';
    }

    // Detect OS
    if (userAgent.includes('Windows NT')) {
      const match = userAgent.match(/Windows NT ([0-9.]+)/);
      const version = match?.[1];
      if (version) {
        const windowsVersions: { [key: string]: string } = {
          '10.0': '10/11',
          '6.3': '8.1',
          '6.2': '8',
          '6.1': '7',
        };
        os = `Windows ${windowsVersions[version] || version}`;
      } else {
        os = 'Windows';
      }
      isDesktop = true;
    } else if (userAgent.includes('Mac OS X') || userAgent.includes('macOS')) {
      const match = userAgent.match(/Mac OS X ([0-9_]+)|macOS ([0-9.]+)/);
      const version = match?.[1]?.replace(/_/g, '.') || match?.[2];
      os = version ? `macOS ${version}` : 'macOS';
      isDesktop = true;
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
      isDesktop = true;
    } else if (userAgent.includes('Android')) {
      const match = userAgent.match(/Android ([0-9.]+)/);
      os = match ? `Android ${match[1]}` : 'Android';
      isMobile = userAgent.includes('Mobile');
      isTablet = !isMobile && userAgent.includes('Android');
    } else if (userAgent.includes('iPhone')) {
      const match = userAgent.match(/OS ([0-9_]+)/);
      const version = match?.[1]?.replace(/_/g, '.');
      os = version ? `iOS ${version}` : 'iOS';
      isMobile = true;
    } else if (userAgent.includes('iPad')) {
      const match = userAgent.match(/OS ([0-9_]+)/);
      const version = match?.[1]?.replace(/_/g, '.');
      os = version ? `iPadOS ${version}` : 'iPadOS';
      isTablet = true;
    }

    // Determine device type
    if (isMobile) {
      device = 'Mobile Device';
    } else if (isTablet) {
      device = 'Tablet';
    } else if (isDesktop) {
      device = 'Desktop Computer';
    }

    return {
      appName: browser,
      appVersion: browserVersion,
      platform: os,
      device: device,
      browser: browser,
      os: os,
      isDesktop: isDesktop,
      isMobile: isMobile,
      isTablet: isTablet,
    };
  }
};

export function UserSessionsDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: Props) {
  const t = useTranslations('user.sessionsDialog');
  const tCommon = useTranslations('user.common');
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const { user: currentUser, signOut } = useAuth();
  const router = useRouter();

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getUserSessions({ userId: user.id });

      if (result.success && result.sessions) {
        setSessions(result.sessions);
      } else {
        toast({
          title: tCommon('error'),
          description: result.error || t('fetchFailed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: tCommon('error'),
        description: tCommon('unexpected'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user.id, t, tCommon]);

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
            title: t('sessionRevoked'),
            description: t('sessionRevokedMessage'),
          });
          fetchSessions();
        } else {
          toast({
            title: tCommon('error'),
            description: result.error || t('revokeFailed'),
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error revoking session:', error);
        toast({
          title: tCommon('error'),
          description: tCommon('unexpected'),
          variant: 'destructive',
        });
      } finally {
        setRevokingSession(null);
      }
    },
    [fetchSessions, t, tCommon],
  );

  const handleRevokeAllSessions = useCallback(async () => {
    try {
      setRevokingAll(true);
      const result = await revokeAllUserSessions({ userId: user.id });

      if (result.success) {
        toast({
          title: t('allSessionsRevoked'),
          description: t('allSessionsRevokedMessage'),
        });

        const isCurrentUser = currentUser && currentUser.id === user.id;

        if (isCurrentUser) {
          toast({
            title: t('signingOut'),
            description: t('signingOutMessage'),
          });

          setTimeout(async () => {
            try {
              await signOut();
              router.push('/login');
            } catch (error) {
              console.error('Error signing out:', error);
              window.location.href = '/login';
            }
          }, 1000);
        } else {
          fetchSessions();
          onSuccess?.();
        }
      } else {
        toast({
          title: tCommon('error'),
          description: result.error || t('revokeAllFailed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      toast({
        title: tCommon('error'),
        description: tCommon('unexpected'),
        variant: 'destructive',
      });
    } finally {
      setRevokingAll(false);
    }
  }, [
    user.id,
    currentUser,
    signOut,
    router,
    fetchSessions,
    onSuccess,
    t,
    tCommon,
  ]);

  // Enhanced icon functions with better logic
  const getDeviceIcon = useCallback((userAgent?: string | null) => {
    if (!userAgent) return IconDeviceDesktop;

    const parsed = parseUserAgent(userAgent);

    if (parsed.isMobile) return IconDeviceMobile;
    if (parsed.isTablet) return IconDeviceTablet;
    return IconDeviceDesktop;
  }, []);

  const getOSIcon = useCallback((userAgent?: string | null) => {
    if (!userAgent) return IconWorld;

    if (userAgent.includes('Windows')) return IconBrandWindows;
    if (userAgent.includes('Mac') || userAgent.includes('Darwin'))
      return IconBrandApple;
    if (userAgent.includes('Linux')) return IconWorld; // Use IconWorld for Linux since IconBrandLinux doesn't exist
    if (userAgent.includes('Android')) return IconBrandAndroid;

    return IconWorld;
  }, []);

  // Format device information
  const formatSessionInfo = useCallback(
    (session: UserSession) => {
      const parsed = parseUserAgent(session.userAgent || '');

      return {
        deviceType: parsed.isDesktop
          ? t('deviceTypes.desktop')
          : parsed.isMobile
            ? t('deviceTypes.mobile')
            : parsed.isTablet
              ? t('deviceTypes.tablet')
              : t('deviceTypes.unknown'),
        appInfo: `${parsed.appName} ${parsed.appVersion}`.trim(),
        platform: parsed.platform,
        device: parsed.device,
        browser: parsed.browser,
        lastSeen: session.lastActiveAt
          ? formatDistanceToNow(new Date(session.lastActiveAt), {
              addSuffix: true,
            })
          : formatDistanceToNow(new Date(session.createdAt), {
              addSuffix: true,
            }),
      };
    },
    [t],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <IconDevices className="mr-2" size={18} />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description', { name: user.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-muted-foreground">
            {t('sessionCount', { count: sessions.length })}
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
              <span className="ml-1">{t('refresh')}</span>
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
              <span>{t('revokeAll')}</span>
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 border rounded-md p-1">
          {loading ? (
            <div className="space-y-3 p-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
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
                <AlertDescription>{t('noSessions')}</AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-3 p-3">
              {sessions.map((session) => {
                const sessionInfo = formatSessionInfo(session);
                const DeviceIcon = getDeviceIcon(session.userAgent);
                const OSIcon = getOSIcon(session.userAgent);

                return (
                  <div
                    key={session.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary">
                        <DeviceIcon size={24} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-base">
                            {sessionInfo.deviceType}
                          </h4>
                          {session.current && (
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs"
                            >
                              {t('currentSession')}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <span className="font-medium">
                            {t('sessionInfo.app')}:
                          </span>
                          <span>{sessionInfo.appInfo}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <OSIcon size={14} />
                          <span>{sessionInfo.platform}</span>
                        </div>

                        {sessionInfo.device !== 'Unknown Device' && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <span className="font-medium">
                              {t('sessionInfo.device')}:
                            </span>
                            <span className="truncate">
                              {sessionInfo.device}
                            </span>
                          </div>
                        )}

                        <Separator className="my-2" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium">
                              {t('sessionInfo.ipAddress')}:
                            </span>
                            <br />
                            <span className="font-mono">
                              {session.ipAddress || t('sessionInfo.unknown')}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              {t('sessionInfo.lastActive')}:
                            </span>
                            <br />
                            <span>{sessionInfo.lastSeen}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleRevokeSession(session.sessionToken)
                        }
                        disabled={
                          revokingSession === session.sessionToken ||
                          session.current
                        }
                        className={session.current ? 'opacity-50' : ''}
                      >
                        {revokingSession === session.sessionToken ? (
                          <IconLoader2 size={16} className="animate-spin" />
                        ) : session.current ? (
                          t('current')
                        ) : (
                          t('revoke')
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-t pt-3">
          <div className="text-xs text-muted-foreground">
            <p>• {t('info.currentSessionNote')}</p>
            <p>• {t('info.revokeNote')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
