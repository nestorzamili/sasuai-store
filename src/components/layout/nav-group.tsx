'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { NavCollapsible, NavItem, NavLink, type NavGroup } from './types';
import Link from 'next/link';

export function NavGroup({ title, items }: NavGroup) {
  const { state } = useSidebar();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`;
          const isActive = checkIsActive(pathname, item);

          if (!item.items)
            return (
              <SidebarMenuLink
                key={key}
                item={item as NavLink}
                isActive={isActive}
              />
            );

          if (state === 'collapsed')
            return (
              <SidebarMenuCollapsedDropdown
                key={key}
                item={item as NavCollapsible}
                isActive={isActive}
              />
            );

          return (
            <SidebarMenuCollapsible
              key={key}
              item={item as NavCollapsible}
              isActive={isActive}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="text-xs rounded-full px-1 py-0">{children}</Badge>
);

const SidebarMenuLink = ({
  item,
  isActive,
}: {
  item: NavLink;
  isActive: boolean;
}) => {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={isActive ? 'bg-accent font-medium' : ''}
      >
        <Link href={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && (
            <item.icon className={isActive ? 'text-primary' : ''} />
          )}
          <span className={isActive ? 'text-primary' : ''}>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SidebarMenuCollapsible = ({
  item,
  isActive,
}: {
  item: NavCollapsible;
  isActive: boolean;
}) => {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  function cn(...classes: string[]): string {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            className={isActive ? 'bg-accent font-medium' : ''}
          >
            {item.icon && (
              <item.icon className={isActive ? 'text-primary' : ''} />
            )}
            <span className={isActive ? 'text-primary' : ''}>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight
              className={cn(
                'ml-auto transition-transform duration-200',
                isActive ? 'text-primary' : '',
                'group-data-[state=open]/collapsible:rotate-90'
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub>
            {item.items.map((subItem) => {
              const isSubItemActive = checkIsActive(pathname, subItem);
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isSubItemActive}
                    className={
                      isSubItemActive ? 'bg-accent/50 font-medium' : ''
                    }
                  >
                    <Link
                      href={subItem.url}
                      onClick={() => setOpenMobile(false)}
                    >
                      {subItem.icon && (
                        <subItem.icon
                          className={isSubItemActive ? 'text-primary' : ''}
                        />
                      )}
                      <span className={isSubItemActive ? 'text-primary' : ''}>
                        {subItem.title}
                      </span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

const SidebarMenuCollapsedDropdown = ({
  item,
  isActive,
}: {
  item: NavCollapsible;
  isActive: boolean;
}) => {
  const pathname = usePathname();

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
            className={isActive ? 'bg-accent font-medium' : ''}
          >
            {item.icon && (
              <item.icon className={isActive ? 'text-primary' : ''} />
            )}
            <span className={isActive ? 'text-primary' : ''}>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto transition-transform duration-200" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge ? `(${item.badge})` : ''}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => {
            const isSubActive = checkIsActive(pathname, sub);
            return (
              <DropdownMenuItem
                key={`${sub.title}-${sub.url}`}
                asChild
                className={isSubActive ? 'bg-accent/50' : ''}
              >
                <Link href={sub.url}>
                  {sub.icon && (
                    <sub.icon className={isSubActive ? 'text-primary' : ''} />
                  )}
                  <span
                    className={`max-w-52 text-wrap ${
                      isSubActive ? 'text-primary font-medium' : ''
                    }`}
                  >
                    {sub.title}
                  </span>
                  {sub.badge && (
                    <span className="ml-auto text-xs">{sub.badge}</span>
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

function checkIsActive(
  currentPath: string,
  item: NavItem,
  mainNav = false
): boolean {
  if (!currentPath) return false;

  return (
    currentPath === item.url ||
    currentPath.split('?')[0] === item.url ||
    !!item?.items?.some((subItem) => checkIsActive(currentPath, subItem)) ||
    (mainNav &&
      currentPath.split('/')[1] !== '' &&
      currentPath.split('/')[1] === item.url?.split('/')[1])
  );
}
