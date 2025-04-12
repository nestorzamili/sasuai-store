'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { getMember } from '../action';
import { MemberWithRelations } from '@/lib/types/member';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MemberProfile from './_components/member-profile';
import MemberPointHistory from './_components/member-point-history';
import MemberRewardHistory from './_components/member-reward-history';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MemberDetailsPage() {
  const router = useRouter();
  const params = useParams();

  // Get the member ID from URL params
  const memberId = useRef<string | null>(
    Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [member, setMember] = useState<MemberWithRelations | null>(null);

  // Fetch member data
  const fetchMember = useCallback(async () => {
    if (!memberId.current) {
      toast({
        title: 'Error',
        description: 'Member ID is missing',
        variant: 'destructive',
      });
      router.push('/members');
      return;
    }

    setIsLoading(true);
    try {
      const result = await getMember(memberId.current);

      if (result.success && result.data) {
        setMember(result.data as MemberWithRelations);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch member details',
          variant: 'destructive',
        });
        router.push('/members');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      router.push('/members');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  return (
    <>
      <Header fixed>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => router.push('/members')}
        >
          <IconArrowLeft size={16} />
          Back to Members
        </Button>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        {isLoading ? (
          <MemberDetailSkeleton />
        ) : member ? (
          <div className="space-y-6">
            <MemberProfile member={member} onUpdate={fetchMember} />

            <Tabs defaultValue="points" className="w-full">
              <TabsList>
                <TabsTrigger value="points">Point History</TabsTrigger>
                <TabsTrigger value="rewards">Reward Claims</TabsTrigger>
              </TabsList>
              <TabsContent value="points">
                <MemberPointHistory
                  memberId={member.id}
                  points={member.memberPoints}
                  memberTier={member.tier}
                />
              </TabsContent>
              <TabsContent value="rewards">
                <MemberRewardHistory
                  memberId={member.id}
                  claims={member.rewardClaims}
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <h2 className="text-xl font-semibold">Member not found</h2>
            <p className="text-muted-foreground mb-4">
              The requested member could not be found
            </p>
            <Button onClick={() => router.push('/members')}>
              Return to Members List
            </Button>
          </div>
        )}
      </Main>
      <Toaster />
    </>
  );
}

function MemberDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Member profile skeleton */}
      <div className="rounded-lg border p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-20 mb-2" />
            <Skeleton className="h-12 w-full mb-4" />
          </div>
          <div className="md:w-1/3">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-20 mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="md:w-1/3">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-12 w-full mb-4" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div>
        <div className="border-b flex">
          <Skeleton className="h-10 w-24 mx-1" />
          <Skeleton className="h-10 w-24 mx-1" />
        </div>
        <div className="pt-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
