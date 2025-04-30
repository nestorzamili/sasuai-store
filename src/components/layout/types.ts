interface User {
  name: string;
  email: string;
  avatar: string;
}

interface Store {
  name: string;
  logo: string;
  plan: string;
}

interface BaseNavItem {
  title: string;
  badge?: string;
  icon?: React.ElementType;
}

type NavLink = BaseNavItem & {
  url: string;
  items?: never;
};

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: string })[];
  url?: never;
};

type NavItem = NavCollapsible | NavLink;

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarData {
  user: User;
  stores: Store[];
  navGroups: NavGroup[];
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink };
