'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StoreForm from './component/store-form';

import {
  IconNotification,
  IconBuildingStore,
  IconAlarm,
} from '@tabler/icons-react';
const DATA_TAB = [
  {
    value: 'store',
    label: 'Store',
    icon: IconBuildingStore,
    desc: 'Manage store information and settings',
  },
  {
    value: 'notification',
    label: 'Notifications',
    icon: IconNotification,
    desc: 'Configure notification preferences and alerts',
  },
  {
    value: 'stockalert',
    label: 'Stock Alerts',
    icon: IconAlarm,
    desc: 'Set up and manage stock alert thresholds',
  },
];
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('store');
  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="store"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-[400px]">
          {DATA_TAB.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={`flex items-center gap-1}`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="store" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-x-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Store Setting
                </h2>
                <p className="text-muted-foreground">
                  Manage store information and settings
                </p>
              </div>
            </div>
            <div>
              <StoreForm />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="notification" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-x-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Notification Settings
                </h2>
                <p className="text-muted-foreground">
                  Configure notification preferences and alerts
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="stockalert" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-x-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Stock Alert Settings
                </h2>
                <p className="text-muted-foreground">
                  Manage stock alert thresholds and notifications
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
