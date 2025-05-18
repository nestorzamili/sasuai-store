import * as React from 'react';
import { SidebarMenu, SidebarMenuButton } from '@/components/ui/sidebar';
import Image from 'next/image';

export function StoreSwitcher({
  stores,
}: {
  stores: {
    name: string;
    logo: string;
    plan: string;
  }[];
}) {
  const [activeStore] = React.useState(stores[0]);

  return (
    <SidebarMenu>
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      >
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
          {typeof activeStore.logo === 'string' ? (
            <Image
              src={activeStore.logo}
              alt={activeStore.name}
              width={40}
              height={40}
              className="size-10 object-contain"
            />
          ) : (
            React.createElement(activeStore.logo, { className: 'size-4' })
          )}
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">{activeStore.name}</span>
          <span className="truncate text-xs">{activeStore.plan}</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenu>
  );
}
