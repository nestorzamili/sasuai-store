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
import { TeamSwitcher } from '@/components/layout/team-switcher';
import { sidebarData } from './data/sidebar-data';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {state === 'collapsed' ? (
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
