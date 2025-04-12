'use client';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Toaster } from '@/components/ui/toaster';
import { InventoryTabs } from './_components/inventory-tabs';

export default function InventoryPage() {
  return (
    <>
      <Header fixed>
        <Search placeholder="Search..." />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <InventoryTabs />
      </Main>
      <Toaster />
    </>
  );
}
