'use client';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import ProfileForm from './components/profile-form';
import ChangePasswordForm from './components/change-password-form';
import { Container } from '@/components/layout/container';
import { Toaster } from '@/components/ui/toaster';

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
          <div className="mx-auto max-w-2xl space-y-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                Profile Settings
              </h1>
              <p className="mt-2 text-muted-foreground">
                Manage your account settings and set your preferences.
              </p>
            </div>
            <ProfileForm />
            <ChangePasswordForm />
          </div>
        </Container>
      </Main>
      <Toaster />
    </>
  );
}
