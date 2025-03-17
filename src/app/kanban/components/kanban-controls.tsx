'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconLayoutGrid,
  IconColumns2,
} from '@tabler/icons-react';

export function KanbanControls() {
  return (
    <div className="flex items-center justify-between border-b px-4 pb-2 pt-2">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search tasks..."
          className="h-8 w-[180px] lg:w-[220px]"
        />
        <Select>
          <SelectTrigger className="w-[110px] h-8 flex items-center">
            <IconFilter className="mr-2 h-3.5 w-3.5" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="my">My Tasks</SelectItem>
            <SelectItem value="priority-high">High Priority</SelectItem>
            <SelectItem value="due-soon">Due Soon</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[120px] h-8 flex items-center">
            <IconSortAscending className="mr-2 h-3.5 w-3.5" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority-asc">
              <div className="flex items-center">
                <IconSortAscending className="mr-2 h-3.5 w-3.5" />
                <span>Priority</span>
              </div>
            </SelectItem>
            <SelectItem value="priority-desc">
              <div className="flex items-center">
                <IconSortDescending className="mr-2 h-3.5 w-3.5" />
                <span>Priority</span>
              </div>
            </SelectItem>
            <SelectItem value="due-asc">Due Date (Asc)</SelectItem>
            <SelectItem value="due-desc">Due Date (Desc)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 px-2 lg:px-3">
          <IconLayoutGrid className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 px-2 lg:px-3">
          <IconColumns2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
