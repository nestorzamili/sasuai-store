'use client';

import { Github } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavGroup } from '@/components/layout/nav-group';
import { StoreSwitcher } from '@/components/layout/store-switcher';
import { getSidebarData } from './data/sidebar-data';
import { Footer } from '@/components/layout/footer';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations();
  const sidebarData = getSidebarData(t);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const footerContent = useMemo(() => {
    if (!isMounted) {
      return (
        <div className="py-4 flex justify-center items-center">
          <Github size={20} />
        </div>
      );
    }

    return state === 'collapsed' ? (
      <Link
        href="https://github.com/nestorzamili"
        target="_blank"
        rel="noopener noreferrer"
        className="flex justify-center items-center py-4 hover:text-primary transition-colors"
        aria-label="GitHub Profile"
      >
        <Github size={20} />
      </Link>
    ) : (
      <Footer />
    );
  }, [isMounted, state]);

  const navGroups = useMemo(
    () =>
      sidebarData.navGroups.map((groupProps) => (
        <NavGroup key={groupProps.title} {...groupProps} />
      )),
    [sidebarData.navGroups],
  );

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <StoreSwitcher stores={sidebarData.stores} />
      </SidebarHeader>
      <SidebarContent>{navGroups}</SidebarContent>
      <SidebarFooter>{footerContent}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
