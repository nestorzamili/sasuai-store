'use client';

import {
  IconArrowDown,
  IconArrowRight,
  IconArrowUp,
  IconCircle,
  IconCircleCheck,
  IconCircleX,
  IconExclamationCircle,
  IconStopwatch,
  IconEdit,
  IconArchive,
} from '@tabler/icons-react';

export const labels = [
  {
    value: 'bug',
    label: 'Bug',
  },
  {
    value: 'feature',
    label: 'Feature',
  },
  {
    value: 'documentation',
    label: 'Documentation',
  },
];

export const statuses = [
  {
    value: 'backlog',
    label: 'Backlog',
    icon: IconExclamationCircle,
  },
  {
    value: 'todo',
    label: 'Todo',
    icon: IconCircle,
  },
  {
    value: 'in progress',
    label: 'In Progress',
    icon: IconStopwatch,
  },
  {
    value: 'in review',
    label: 'In Review',
    icon: IconEdit,
  },
  {
    value: 'done',
    label: 'Done',
    icon: IconCircleCheck,
  },
  {
    value: 'canceled',
    label: 'Canceled',
    icon: IconCircleX,
  },
  {
    value: 'archived',
    label: 'Archived',
    icon: IconArchive,
  },
];

export const priorities = [
  {
    label: 'Low',
    value: 'low',
    icon: IconArrowDown,
  },
  {
    label: 'Medium',
    value: 'medium',
    icon: IconArrowRight,
  },
  {
    label: 'High',
    value: 'high',
    icon: IconArrowUp,
  },
];

export const kanbanColumns = [
  { id: 'todo', name: 'Todo' },
  { id: 'in progress', name: 'In Progress' },
  { id: 'in review', name: 'In Review' },
  { id: 'backlog', name: 'Backlog' },
  { id: 'done', name: 'Done' },
  { id: 'canceled', name: 'Canceled' },
];
