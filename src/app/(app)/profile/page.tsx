'use client';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Toaster } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Container } from '@/components/layout/container';
import { UserCircle2, Lock } from 'lucide-react';
import ProfileForm from './components/profile-form';
import ChangePasswordForm from './components/change-password-form';

export default function ProfilePage() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <Container>
          <div className="mx-auto max-w-3xl py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                Profile Settings
              </h1>
              <p className="mt-2 text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2"
                >
                  <UserCircle2 size={16} />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex items-center gap-2"
                >
                  <Lock size={16} />
                  <span>Security</span>
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
      </Main>
      <Toaster />
    </>
  );
}
