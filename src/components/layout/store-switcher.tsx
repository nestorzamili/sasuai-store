'use client';
import * as React from 'react';
import { SidebarMenu, SidebarMenuButton } from '@/components/ui/sidebar';
import Image from 'next/image';
import { getSettingFields, getStore } from '@/app/(app)/settings/action';
import { useEffect } from 'react';
type stores = {
  store_name: string;
  logo_url: string;
  store_type: string;
};
export function StoreSwitcher() {
  const [store, setStore] = React.useState<stores | null>(null);
  const getSetting = async () => {
    try {
      const response = await getStore();
      if (response.success) {
        setStore({
          store_name: response.data.store_name,
          logo_url: response.data.logo_url,
          store_type: response.data.type,
        });
      }
    } catch (error) {
      console.error('Failed to fetch store name:', error);
    }
  };
  useEffect(() => {
    getSetting();
  }, []);
  return (
    <SidebarMenu>
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      >
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
          {/* {typeof store?.logo_url === 'string' ? (
            <Image
              src={store?.logo_url}
              alt={store?.store_name}
              width={32}
              height={32}
              className="size-8 object-contain"
              style={{ width: 'auto', height: 'auto' }}
            />
          ) : (
            React.createElement(
              store?.logo_url || '../../../../public/images/logo.png',
              {
                className: 'size-4',
              }
            )
          )} */}
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">
            {store?.store_name || 'Unknown Store'}
          </span>
          <span className="truncate text-xs">
            {store?.store_type || 'Unknown Type'}
          </span>
        </div>
      </SidebarMenuButton>
    </SidebarMenu>
  );
}
