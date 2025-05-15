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
  IconUsersGroup,
  IconGift,
} from '@tabler/icons-react';
import { type SidebarData } from '../types';
import logo from '../../../../public/images/logo.png';

export const sidebarData: SidebarData = {
  stores: [
    {
      name: 'Sasuai Store',
      logo: logo.src,
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
          title: 'Transactions',
          url: '/transactions',
          icon: IconShoppingCart,
        },
      ],
    },
    {
      title: 'Inventory Management',
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
          title: 'Brands',
          url: '/products/brands',
          icon: IconBuildingStore,
        },
        {
          title: 'Units',
          url: '/products/units',
          icon: IconPackage,
        },
        {
          title: 'Inventory',
          url: '/inventory',
          icon: IconPackage,
        },
      ],
    },
    {
      title: 'Supply Chain',
      items: [
        {
          title: 'Suppliers',
          url: '/suppliers',
          icon: IconTruck,
        },
      ],
    },
    {
      title: 'Marketing',
      items: [
        {
          title: 'Discounts',
          url: '/discounts',
          icon: IconDiscount,
        },
        {
          title: 'Members',
          url: '/members',
          icon: IconUsersGroup,
        },
        {
          title: 'Rewards',
          url: '/rewards',
          icon: IconGift,
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          title: 'Users',
          url: '/users',
          icon: IconUsers,
        },
      ],
    },
    {
      title: 'Integrations',
      items: [
        {
          title: 'Blastify',
          url: 'https://blastify.tech',
          icon: IconPlane,
        },
      ],
    },
    {
      title: 'Support',
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
