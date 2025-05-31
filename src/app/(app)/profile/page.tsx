'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Container } from '@/components/layout/container';
import { UserCircle2, Lock } from 'lucide-react';
import ProfileForm from './components/profile-form';
import ChangePasswordForm from './components/change-password-form';

export default function ProfilePage() {
  const t = useTranslations('profile');

  return (
    <>
      <Container>
        <div className="mx-auto max-w-3xl py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="mt-2 text-muted-foreground">{t('description')}</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserCircle2 size={16} />
                <span>{t('tabs.profile')}</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock size={16} />
                <span>{t('tabs.security')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileForm />
            </TabsContent>

            <TabsContent value="security">
              <ChangePasswordForm />
            </TabsContent>
          </Tabs>
        </div>
      </Container>
    </>
  );
}
