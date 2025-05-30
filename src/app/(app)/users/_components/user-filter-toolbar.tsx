'use client';

import { useTranslations } from 'next-intl';
import {
  IconFilterOff,
  IconUserCog,
  IconUserCancel,
  IconUserCheck,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { UserRoleFilter, UserStatusFilter } from '@/lib/types/user';
import { useCallback } from 'react';

interface UserFilterToolbarProps {
  role: UserRoleFilter;
  setRole: (value: UserRoleFilter) => void;
  status: UserStatusFilter;
  setStatus: (value: UserStatusFilter) => void;
}

export default function UserFilterToolbar({
  role,
  setRole,
  status,
  setStatus,
}: UserFilterToolbarProps) {
  const t = useTranslations('user.table.filters');

  // Determine if any filters are active
  const hasActiveFilters = role !== 'ALL_ROLES' || status !== 'ALL';

  // Role options with translations
  const roles = [
    { value: 'ALL_ROLES', label: t('allRoles') },
    {
      value: 'admin',
      label: t('roles.admin'),
      icon: <IconUserCog size={16} />,
    },
    {
      value: 'user',
      label: t('roles.user'),
      icon: <IconUserCheck size={16} />,
    },
  ];

  // Status options with translations
  const statuses = [
    { value: 'ALL', label: t('allStatuses') },
    {
      value: 'Active',
      label: t('statusOptions.active'),
      icon: <IconUserCheck size={16} />,
    },
    {
      value: 'banned',
      label: t('statusOptions.banned'),
      icon: <IconUserCancel size={16} />,
    },
  ];

  // Handle clearing all filters - stabilize with useCallback
  const handleClearAllFilters = useCallback(() => {
    setRole('ALL_ROLES');
    setStatus('ALL');
  }, [setRole, setStatus]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Role filter */}
      <div className="w-[160px] shrink-0">
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger
            className={cn(
              role !== 'ALL_ROLES' && 'border-primary text-primary',
            )}
          >
            <SelectValue placeholder={t('role')}>
              {role && (
                <div className="flex items-center gap-2">
                  {roles.find((r) => r.value === role)?.icon}
                  <span className="overflow-hidden text-ellipsis">
                    {roles.find((r) => r.value === role)?.label || t('role')}
                  </span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                <div className="flex items-center gap-2 w-full">
                  {r.icon && <div className="flex-shrink-0">{r.icon}</div>}
                  <span>{r.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status filter */}
      <div className="w-[160px] shrink-0">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger
            className={cn(status !== 'ALL' && 'border-primary text-primary')}
          >
            <SelectValue placeholder={t('status')}>
              {status && (
                <div className="flex items-center gap-2">
                  {statuses.find((s) => s.value === status)?.icon}
                  <span className="overflow-hidden text-ellipsis">
                    {statuses.find((s) => s.value === status)?.label ||
                      t('status')}
                  </span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                <div className="flex items-center gap-2 w-full">
                  {s.icon && <div className="flex-shrink-0">{s.icon}</div>}
                  <span>{s.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear All Filters Button */}
      <Button
        variant={hasActiveFilters ? 'destructive' : 'outline'}
        size="sm"
        onClick={handleClearAllFilters}
        disabled={!hasActiveFilters}
        className="shrink-0"
      >
        <IconFilterOff size={16} className="mr-2" />
        <span>{t('clearFilters')}</span>
      </Button>
    </div>
  );
}
