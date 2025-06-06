'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function DashboardTabs({
  onValueChange,
}: {
  onValueChange?: (value: string) => void;
}) {
  const [filterDate, setFilterDate] = useState('today');
  const handleValuesChange = (value: string) => {
    setFilterDate(value);
    if (onValueChange) {
      onValueChange(value);
    }
  };

  return (
    <Tabs
      defaultValue="batches"
      value={filterDate}
      onValueChange={handleValuesChange}
      className="w-full"
    >
      <TabsList className="grid grid-cols-3 w-[400px]">
        <TabsTrigger value="today" className="flex items-center gap-1">
          <span>Today</span>
        </TabsTrigger>
        <TabsTrigger value="last7Days">
          <span>Last 7 Days</span>
        </TabsTrigger>
        <TabsTrigger value="last30Days">
          <span>Last 30 Days</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
