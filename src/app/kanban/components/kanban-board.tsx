'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { IconCalendar, IconPlus } from '@tabler/icons-react';
import { kanbanColumns } from '../data/data';
import { tasks } from '../data/tasks';
import { Task } from '../data/schema';
import { useTasks } from '../context/tasks-context';

export function KanbanBoard() {
  const { setOpen, setCurrentRow } = useTasks();
  const [collapsedColumns, setCollapsedColumns] = useState<
    Record<string, boolean>
  >({});

  // Group tasks by status
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const toggleColumn = (columnId: string) => {
    setCollapsedColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return '';
    }
  };

  const getColumnColors = (columnId: string) => {
    switch (columnId) {
      case 'todo':
        return {
          bg: 'bg-blue-50/50 dark:bg-blue-950/20',
          border: 'border-blue-200 dark:border-blue-800',
          indicator: 'bg-blue-500 dark:bg-blue-400',
          header: 'bg-blue-600 dark:bg-blue-800',
        };
      case 'in progress':
        return {
          bg: 'bg-amber-50/50 dark:bg-amber-950/20',
          border: 'border-amber-200 dark:border-amber-800',
          indicator: 'bg-amber-500 dark:bg-amber-400',
          header: 'bg-amber-600 dark:bg-amber-700',
        };
      case 'in review':
        return {
          bg: 'bg-purple-50/50 dark:bg-purple-950/20',
          border: 'border-purple-200 dark:border-purple-800',
          indicator: 'bg-purple-500 dark:bg-purple-400',
          header: 'bg-purple-600 dark:bg-purple-700',
        };
      case 'backlog':
        return {
          bg: 'bg-orange-50/50 dark:bg-orange-950/20',
          border: 'border-orange-200 dark:border-orange-800',
          indicator: 'bg-orange-500 dark:bg-orange-400',
          header: 'bg-orange-600 dark:bg-orange-700',
        };
      case 'done':
        return {
          bg: 'bg-green-50/50 dark:bg-green-950/20',
          border: 'border-green-200 dark:border-green-800',
          indicator: 'bg-green-500 dark:bg-green-400',
          header: 'bg-green-600 dark:bg-green-700',
        };
      case 'canceled':
        return {
          bg: 'bg-gray-50/50 dark:bg-gray-950/20',
          border: 'border-gray-200 dark:border-gray-800',
          indicator: 'bg-gray-500 dark:bg-gray-400',
          header: 'bg-gray-600 dark:bg-gray-700',
        };
      default:
        return {
          bg: 'bg-muted/30',
          border: 'border-border',
          indicator: 'bg-gray-500',
          header: 'bg-gray-600 dark:bg-gray-700',
        };
    }
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto px-4">
      <div className="flex gap-4 pb-4 pt-2">
        {kanbanColumns.map((column) => {
          const colors = getColumnColors(column.id);
          const columnTasks = groupedTasks[column.id] || [];
          const hasTask = columnTasks.length > 0;
          const taskCount = columnTasks.length;

          return (
            <div
              key={column.id}
              className={`transition-all duration-300 ease-out flex-shrink-0
                ${collapsedColumns[column.id] ? 'w-10' : 'w-80'}`}
            >
              <Collapsible
                className={`${colors.bg} border ${colors.border} rounded-md
                  transition-all duration-300 ease-out
                  ${collapsedColumns[column.id] ? 'h-[180px]' : 'h-auto'}`}
                open={!collapsedColumns[column.id]}
                onOpenChange={() => toggleColumn(column.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-2 border-b">
                  <div className="flex items-center gap-2">
                    <CollapsibleTrigger asChild>
                      <div
                        className={`${
                          colors.header
                        } rounded cursor-pointer flex items-center gap-1.5 py-1 px-2 shadow-sm
                          ${
                            collapsedColumns[column.id]
                              ? 'w-full justify-center'
                              : ''
                          }`}
                      >
                        <div className="h-2 w-2 rounded-full bg-white" />
                        {!collapsedColumns[column.id] && (
                          <span className="font-medium text-xs text-white">
                            {column.name}
                          </span>
                        )}
                      </div>
                    </CollapsibleTrigger>

                    {!collapsedColumns[column.id] && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {taskCount}
                      </span>
                    )}
                  </div>

                  {/* Plus button with invisible class to maintain layout */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 shrink-0 rounded-full hover:bg-primary/10 ${
                      collapsedColumns[column.id] ? 'invisible' : ''
                    }`}
                    onClick={() => setOpen('create')}
                  >
                    <IconPlus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Simplified collapsed view layout - no background on title */}
                {collapsedColumns[column.id] && (
                  <div className="flex flex-col h-full items-center justify-between py-4">
                    {/* Middle area with title - no background container */}
                    <div className="flex-1 flex items-center">
                      <span className="transform rotate-90 whitespace-nowrap font-medium text-xs">
                        {column.name}
                      </span>
                    </div>

                    {/* Count at bottom */}
                    <span className="text-xs font-medium mt-2">
                      {taskCount}
                    </span>
                  </div>
                )}

                {/* Tasks content area */}
                <CollapsibleContent>
                  {hasTask ? (
                    <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
                      <div className="p-1.5 space-y-2">
                        {columnTasks.map((task) => (
                          <Card
                            key={task.id}
                            className="bg-card hover:shadow-md transition-shadow border cursor-pointer"
                            onClick={() => {
                              setCurrentRow(task);
                              setOpen('update');
                            }}
                          >
                            <CardHeader className="p-2.5 pb-0">
                              <CardTitle className="text-sm font-medium">
                                {task.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-2.5 pt-1.5">
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {task.id}
                              </p>
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs px-1.5 ${getPriorityColor(
                                      task.priority,
                                    )}`}
                                  >
                                    {task.priority}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0 h-4"
                                  >
                                    {task.label}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {/* Add task button at the bottom of tasks */}
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-center text-xs h-8 border-dashed"
                            onClick={() => setOpen('create')}
                          >
                            <IconPlus className="mr-1.5 h-3.5 w-3.5" />
                            Add task
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 flex items-center justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => setOpen('create')}
                      >
                        <IconPlus className="h-3.5 w-3.5" />
                        Add task
                      </Button>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </div>
    </div>
  );
}
