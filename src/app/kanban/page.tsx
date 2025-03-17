'use client';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { KanbanBoard } from '@/app/kanban/components/kanban-board';
import { KanbanControls } from '@/app/kanban/components/kanban-controls';
import { TasksDialogs } from './components/tasks-dialogs';
import { TasksPrimaryButtons } from './components/tasks-primary-buttons';
import TasksProvider from './context/tasks-context';

export default function Tasks() {
  return (
    <TasksProvider>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="flex flex-col overflow-hidden p-0 pt-2">
        <div className="px-4 mb-2 flex items-center justify-between space-y-2 flex-wrap gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <TasksPrimaryButtons />
        </div>

        <div className="flex-1 overflow-hidden">
          <KanbanControls />
          <KanbanBoard />
        </div>
      </Main>

      <TasksDialogs />
    </TasksProvider>
  );
}
