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

export const getSidebarData = (t: (key: string) => string): SidebarData => ({
  stores: [
    {
      name: t('sidebar.store.name'),
      logo: logo.src,
      plan: t('sidebar.store.plan'),
    },
  ],
  navGroups: [
    {
      title: t('sidebar.groups.general'),
      items: [
        {
          title: t('sidebar.items.dashboard'),
          url: '/',
          icon: IconLayoutDashboard,
        },
        {
          title: t('sidebar.items.transactions'),
          url: '/transactions',
          icon: IconShoppingCart,
        },
      ],
    },
    {
      title: t('sidebar.groups.inventoryManagement'),
      items: [
        {
          title: t('sidebar.items.products'),
          url: '/products',
          icon: IconBoxSeam,
        },
        {
          title: t('sidebar.items.categories'),
          url: '/products/categories',
          icon: IconCategory,
        },
        {
          title: t('sidebar.items.brands'),
          url: '/products/brands',
          icon: IconBuildingStore,
        },
        {
          title: t('sidebar.items.units'),
          url: '/products/units',
          icon: IconPackage,
        },
        {
          title: t('sidebar.items.inventory'),
          url: '/inventory',
          icon: IconPackage,
        },
      ],
    },
    {
      title: t('sidebar.groups.supplyChain'),
      items: [
        {
          title: t('sidebar.items.suppliers'),
          url: '/suppliers',
          icon: IconTruck,
        },
      ],
    },
    {
      title: t('sidebar.groups.marketing'),
      items: [
        {
          title: t('sidebar.items.discounts'),
          url: '/discounts',
          icon: IconDiscount,
        },
        {
          title: t('sidebar.items.members'),
          url: '/members',
          icon: IconUsersGroup,
        },
        {
          title: t('sidebar.items.rewards'),
          url: '/rewards',
          icon: IconGift,
        },
      ],
    },
    {
      title: t('sidebar.groups.administration'),
      items: [
        {
          title: t('sidebar.items.users'),
          url: '/users',
          icon: IconUsers,
        },
      ],
    },
    {
      title: t('sidebar.groups.integrations'),
      items: [
        {
          title: t('sidebar.items.blastify'),
          url: 'https://blastify.tech',
          icon: IconPlane,
        },
      ],
    },
    {
      title: t('sidebar.groups.support'),
      items: [
        {
          title: t('sidebar.items.helpCenter'),
          url: '/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
});

// Default export for backward compatibility
export const sidebarData: SidebarData = getSidebarData(() => '');
