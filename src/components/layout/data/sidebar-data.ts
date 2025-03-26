'use client';

import {
  IconChecklist,
  IconHelp,
  IconLayoutDashboard,
  IconMessages,
  IconPackages,
  IconUsers,
  IconShoppingCart,
  IconBoxSeam,
  IconFileInvoice,
  IconCreditCard,
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
          title: 'Help Center',
          url: '/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
};
