'use client';

import {
  IconHelp,
  IconLayoutDashboard,
  IconUsers,
  IconShoppingCart,
  IconBoxSeam,
  IconDiscount,
  IconCategory,
  IconTruck,
  IconPlane,
  IconPackage,
  IconBuildingStore,
  IconListCheck,
  IconUsersGroup,
  IconGift,
  IconCubeSend,
} from '@tabler/icons-react';
import { Command } from 'lucide-react';
import { type SidebarData } from '../types';

export const sidebarData: SidebarData = {
  user: {
    name: 'sasuai',
    email: 'admin@sasuai.com',
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
          title: 'Orders',
          url: '/orders',
          icon: IconShoppingCart,
        },
        {
          title: 'Task',
          url: '/tasks',
          icon: IconCubeSend,
        },
        {
          title: 'Suppliers',
          url: '/suppliers',
          icon: IconTruck,
        },
      ],
    },
    {
      title: 'Product Management',
      items: [
        {
          title: 'Products',
          url: '/products',
          icon: IconBoxSeam,
        },
        {
          title: 'Categories',
          url: '/products/categories',
          icon: IconCategory,
        },
        {
          title: 'Stock',
          url: '/products/stock',
          icon: IconPackage,
        },
        {
          title: 'Brands',
          url: '/products/brands',
          icon: IconBuildingStore,
        },
        {
          title: 'Units',
          url: '/products/units',
          icon: IconPackage,
        },
      ],
    },
    {
      title: 'Discount Management',
      items: [
        {
          title: 'Discounts',
          url: '/discounts',
          icon: IconDiscount,
        },
      ],
    },
    {
      title: 'Member Management',
      items: [
        {
          title: 'Members',
          url: '/members',
          icon: IconUsersGroup,
        },
        {
          title: 'Plans',
          url: '/members/plans',
          icon: IconListCheck,
        },
        {
          title: 'Reward',
          url: '/members/reward',
          icon: IconGift,
        },
      ],
    },
    {
      title: 'User Management',
      items: [
        {
          title: 'Users',
          url: '/users',
          icon: IconUsers,
        },
      ],
    },
    {
      title: 'Partner Platform',
      items: [
        {
          title: 'Blastify',
          url: 'https://blastify.tech',
          icon: IconPlane,
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
