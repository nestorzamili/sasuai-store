'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from '@/hooks/use-toast';
import { getMember } from '../action';
import {
  MemberWithRelations,
  mapToMemberWithRelations,
  MemberResponse,
} from '@/lib/types/member';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MemberProfile from './_components/member-profile';
import MemberPointHistory from './_components/member-point-history';
import MemberRewardHistory from './_components/member-reward-history';
import { Skeleton } from '@/components/ui/skeleton';

export default function MemberDetailsPage() {
  const t = useTranslations('member.detailPage');
  const tCommon = useTranslations('member.common');
  const router = useRouter();
  const params = useParams();

  // Get the member ID from URL params
  const memberId = useRef<string | null>(
    Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [member, setMember] = useState<MemberWithRelations | null>(null);

  // Fetch member data
  const fetchMember = async () => {
    if (!memberId.current) {
      toast({
        title: tCommon('error'),
        description: t('errors.missingId'),
        variant: 'destructive',
      });
      router.push('/members');
      return;
    }

    setIsLoading(true);
    try {
      const result = await getMember(memberId.current);

      if (result.success && result.data) {
        // Use the simplified mapping utility with proper type
        const memberData = mapToMemberWithRelations(
          result.data as MemberResponse,
        );

        setMember(memberData);

        // Update breadcrumb only when we have the actual member name
        if (typeof window !== 'undefined' && window.__updateBreadcrumb) {
          window.__updateBreadcrumb(memberId.current, memberData.name);
        }
      } else {
        toast({
          title: tCommon('error'),
          description: result.error || t('errors.fetchFailed'),
          variant: 'destructive',
        });
        router.push('/members');
      }
    } catch (error) {
      console.error('Failed to fetch member:', error);
      toast({
        title: tCommon('error'),
        description: tCommon('unexpectedError'),
        variant: 'destructive',
      });
      router.push('/members');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchMember();
  }, []);

  return (
    <>
      {isLoading ? (
        <MemberDetailSkeleton />
      ) : member ? (
        <div className="space-y-6">
          <MemberProfile member={member} onUpdate={fetchMember} />

          <Tabs defaultValue="points" className="w-full">
            <TabsList>
              <TabsTrigger value="points">{t('tabs.pointHistory')}</TabsTrigger>
              <TabsTrigger value="rewards">
                {t('tabs.rewardClaims')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="points">
              <MemberPointHistory
                memberId={member.id}
                points={member.memberPoints}
                memberTier={member.tier || undefined}
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
          <h2 className="text-xl font-semibold">{t('notFound.title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('notFound.description')}
          </p>
          <button
            className="text-primary underline hover:no-underline"
            onClick={() => router.push('/members')}
          >
            {t('notFound.returnButton')}
          </button>
        </div>
      )}
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
