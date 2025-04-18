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
import { sidebarData } from './data/sidebar-data';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  // Added for hydration-safe rendering
  const [mounted, setMounted] = useState(false);

  // Only show client-side content after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <StoreSwitcher stores={sidebarData.stores} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {/* Render a non-interactive placeholder during server render */}
        {!mounted ? (
          <div className="py-4 flex justify-center items-center">
            <Github size={20} />
          </div>
        ) : state === 'collapsed' ? (
          <Link
            href="https://github.com/nestorzamili"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center py-4 hover:text-primary transition-colors"
          >
            <Github size={20} />
          </Link>
        ) : (
          <Footer />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
