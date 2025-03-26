'use client';

import {
  IconBrowserCheck,
  IconChecklist,
  IconHelp,
  IconLayoutDashboard,
  IconMessages,
  IconNotification,
  IconPackages,
  IconPalette,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUsers,
  IconShoppingCart,
  IconBoxSeam,
  IconFileInvoice,
  IconCreditCard,
  IconArrowBackUp,
  IconTruckDelivery,
  IconDiscount,
} from '@tabler/icons-react';
import { Command, KanbanIcon } from 'lucide-react';
import { type SidebarData } from '../types';

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  stores: [
    {
      name: 'Sasuai Store',
      logo: Command,
      plan: 'Store Management',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: IconLayoutDashboard,
        },
        {
          title: 'Kanban',
          url: '/kanban',
          icon: KanbanIcon,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: IconChecklist,
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: IconPackages,
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: IconMessages,
        },
        {
          title: 'Users',
          url: '/users',
          icon: IconUsers,
        },
        {
          title: 'Products',
          url: '/products',
          icon: IconBoxSeam,
        },
        {
          title: 'Orders',
          url: '/orders',
          icon: IconShoppingCart,
        },
        {
          title: 'Invoices',
          url: '/invoices',
          icon: IconFileInvoice,
        },
        {
          title: 'Payments',
          url: '/payments',
          icon: IconCreditCard,
        },
        {
          title: 'Shipping',
          url: '/shipping',
          icon: IconTruckDelivery,
        },
        {
          title: 'Discounts',
          url: '/discounts',
          icon: IconDiscount,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: IconSettings,
          items: [
            {
              title: 'Profile',
              url: '/settings/profile',
              icon: IconUserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: IconTool,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: IconPalette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: IconNotification,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: IconBrowserCheck,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
};
