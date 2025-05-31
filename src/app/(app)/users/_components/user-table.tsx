'use client';

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import {
  IconTrash,
  IconEdit,
  IconBan,
  IconKey,
  IconDevices,
  IconUserCheck,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableLayout } from '@/components/layout/table-layout';
import { useFetch } from '@/hooks/use-fetch';
import { getPaginatedUsers } from '../action';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TableFetchOptions } from '@/hooks/use-fetch';
import { Badge } from '@/components/ui/badge';
import UserFilterToolbar from './user-filter-toolbar';
import { UserDeleteDialog } from './user-delete-dialog';
import { UserBanDialog } from './user-ban-dialog';
import { UserRoleDialog } from './user-role-dialog';
import { UserSessionsDialog } from './user-sessions-dialog';
import {
  User,
  UserRole,
  UserFilters,
  UserSortingOptions,
  UserRoleFilter,
  UserStatusFilter,
} from '@/lib/types/user';

interface UserTableProps {
  onEdit?: (user: User) => void;
  onRefresh?: () => void;
}

export function UserTable({ onEdit, onRefresh }: UserTableProps) {
  const t = useTranslations('user.table');

  // State for dialogs
  const [selectedUserForDelete, setSelectedUserForDelete] =
    useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedUserForBan, setSelectedUserForBan] = useState<User | null>(
    null,
  );
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);

  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(
    null,
  );
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  const [selectedUserForSessions, setSelectedUserForSessions] =
    useState<User | null>(null);
  const [isSessionsDialogOpen, setIsSessionsDialogOpen] = useState(false);

  // Filter states with proper types
  const [role, setRole] = useState<UserRoleFilter>('ALL_ROLES');
  const [status, setStatus] = useState<UserStatusFilter>('ALL');

  // Handlers for dialogs - stabilize with useCallback
  const handleDeleteClick = useCallback((user: User) => {
    setSelectedUserForDelete(user);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleBanClick = useCallback((user: User) => {
    setSelectedUserForBan(user);
    setIsBanDialogOpen(true);
  }, []);

  const handleRoleClick = useCallback((user: User) => {
    setSelectedUserForRole(user);
    setIsRoleDialogOpen(true);
  }, []);

  const handleSessionsClick = useCallback((user: User) => {
    setSelectedUserForSessions(user);
    setIsSessionsDialogOpen(true);
  }, []);

  const fetchUsers = useCallback(
    async (
      options: TableFetchOptions,
    ): Promise<{
      data: User[];
      totalRows: number;
    }> => {
      // Handle role filter
      let roleFilter: UserRole | undefined;
      if (options.filters?.role && options.filters.role !== 'ALL_ROLES') {
        roleFilter = options.filters.role as UserRole;
      }

      // Handle status filter
      let bannedFilter: boolean | undefined;
      if (options.filters?.status === 'banned') {
        bannedFilter = true;
      } else if (options.filters?.status === 'active') {
        bannedFilter = false;
      }

      const response = await getPaginatedUsers({
        page: (options.page ?? 0) + 1,
        pageSize: options.limit ?? 10,
        sortField: options.sortBy?.id || 'createdAt',
        sortDirection: options.sortBy?.desc ? 'desc' : 'asc',
        search: options.search,
        role: roleFilter,
        banned: bannedFilter,
      });

      if (response.success && response.data) {
        return {
          data: response.data,
          totalRows: response.pagination?.totalCount || 0,
        };
      }

      return {
        data: [],
        totalRows: 0,
      };
    },
    [],
  );

  const {
    data,
    isLoading,
    options,
    setPage,
    setLimit,
    setSortBy,
    setSearch,
    setFilters,
    totalRows,
    refresh,
  } = useFetch<User[]>({
    fetchData: fetchUsers,
    initialPageIndex: 0,
    initialPageSize: 10,
    initialSortField: 'createdAt',
    initialSortDirection: true,
  });

  const handlePaginationChange = useCallback(
    (newPagination: { pageIndex: number; pageSize: number }) => {
      setPage(newPagination.pageIndex);
      setLimit(newPagination.pageSize);
    },
    [setPage, setLimit],
  );

  const handleSortingChange = useCallback(
    (newSorting: UserSortingOptions) => {
      setSortBy(newSorting);
    },
    [setSortBy],
  );

  const handleSearchChange = useCallback(
    (newSearch: string) => {
      setSearch(newSearch);
    },
    [setSearch],
  );

  const handleFilterChange = useCallback(
    (key: string, value: UserRoleFilter | UserStatusFilter | null) => {
      if (
        (key === 'role' && value === 'ALL_ROLES') ||
        (key === 'status' && value === 'ALL')
      ) {
        setFilters((prev: UserFilters) => {
          const newFilters = { ...prev };
          delete newFilters[key as keyof UserFilters];
          return newFilters;
        });
        return;
      }

      if (key === 'role') {
        setRole(value as UserRoleFilter);
      }

      if (key === 'status') {
        setStatus(value as UserStatusFilter);
      }

      setFilters((prev: UserFilters) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setRole, setStatus, setFilters],
  );

  // Get initials for avatar - stabilize with useCallback
  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, []);

  // Handle dialog success - stabilize with useCallback
  const handleDialogSuccess = useCallback(() => {
    refresh();
    if (onRefresh) onRefresh();
  }, [refresh, onRefresh]);

  // Define columns with translations
  const columns: ColumnDef<User>[] = useMemo(
    () => [
      // User info column with avatar
      {
        id: 'user',
        header: t('columns.name'),
        accessorFn: (row) => row.name,
        cell: ({ row }) => {
          const user = row.original;
          const userImage = user.image || user.data?.image;

          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={userImage} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="font-medium">{user.name}</div>
            </div>
          );
        },
      },

      // Email column
      {
        accessorKey: 'email',
        header: t('columns.email'),
        cell: ({ row }) => {
          return (
            <div className="text-sm text-muted-foreground">
              {row.getValue('email')}
            </div>
          );
        },
      },

      // Role column
      {
        accessorKey: 'role',
        header: t('columns.role'),
        cell: ({ row }) => {
          const role = row.getValue('role') as string;
          const roleLabel =
            role === 'admin'
              ? t('roles.admin')
              : role === 'cashier'
                ? t('roles.cashier')
                : t('roles.user');
          return (
            <Badge
              variant={role === 'admin' ? 'default' : 'outline'}
              className="capitalize"
            >
              {roleLabel}
            </Badge>
          );
        },
      },

      // Status column
      {
        id: 'status',
        header: t('columns.status'),
        accessorFn: (row) => row.banned,
        cell: ({ row }) => {
          const banned = row.original.banned;
          return banned ? (
            <Badge variant="destructive">{t('status.banned')}</Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              {t('status.active')}
            </Badge>
          );
        },
      },

      // Verified column
      {
        id: 'verified',
        header: t('columns.verified'),
        accessorFn: (row) => row.data?.emailVerified,
        cell: ({ row }) => {
          const verified = row.original.data?.emailVerified;
          return verified ? (
            <div className="flex items-center text-green-600">
              <IconUserCheck size={16} className="mr-1" />{' '}
              {t('status.verified')}
            </div>
          ) : (
            <span className="text-muted-foreground">
              {t('status.unverified')}
            </span>
          );
        },
      },

      // Created at column
      {
        accessorKey: 'createdAt',
        header: t('columns.createdAt'),
        cell: ({ row }) => {
          const createdAt =
            row.original.createdAt || row.original.data?.createdAt;
          if (!createdAt) return <span>-</span>;

          const date = new Date(createdAt);
          return <div>{date.toLocaleDateString()}</div>;
        },
      },

      // Actions column
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const user = row.original;
          const isBanned = user.banned;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{t('actions.openMenu')}</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('actions.actions')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => onEdit?.(user)}
                  >
                    {t('actions.edit')} <IconEdit className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => handleRoleClick(user)}
                  >
                    {t('actions.changeRole')} <IconKey className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => handleSessionsClick(user)}
                  >
                    {t('actions.sessions')} <IconDevices className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer"
                    onClick={() => handleBanClick(user)}
                  >
                    {isBanned ? t('actions.unban') : t('actions.ban')}{' '}
                    <IconBan className="h-4 w-4" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex justify-between cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(user)}
                  >
                    {t('actions.delete')} <IconTrash className="h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [
      t,
      getInitials,
      onEdit,
      handleRoleClick,
      handleSessionsClick,
      handleBanClick,
      handleDeleteClick,
    ],
  );

  // Simplified filter toolbar - memoize to prevent re-creation
  const filterToolbarElement = useMemo(
    () => (
      <UserFilterToolbar
        role={role}
        setRole={(value) => handleFilterChange('role', value)}
        status={status}
        setStatus={(value) => handleFilterChange('status', value)}
      />
    ),
    [role, status, handleFilterChange],
  );

  return (
    <>
      <TableLayout
        data={data || []}
        columns={columns}
        isLoading={isLoading}
        pagination={options.pagination}
        handlePaginationChange={handlePaginationChange}
        handleSortingChange={handleSortingChange}
        handleSearchChange={handleSearchChange}
        totalRows={totalRows}
        enableSelection={true}
        filterToolbar={filterToolbarElement}
      />

      {/* Delete dialog */}
      {selectedUserForDelete && (
        <UserDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          user={selectedUserForDelete}
          onSuccess={handleDialogSuccess}
        />
      )}

      {/* Ban dialog */}
      {selectedUserForBan && (
        <UserBanDialog
          open={isBanDialogOpen}
          onOpenChange={setIsBanDialogOpen}
          user={selectedUserForBan}
          onSuccess={handleDialogSuccess}
        />
      )}

      {/* Role dialog */}
      {selectedUserForRole && (
        <UserRoleDialog
          open={isRoleDialogOpen}
          onOpenChange={setIsRoleDialogOpen}
          user={selectedUserForRole}
          onSuccess={handleDialogSuccess}
        />
      )}

      {/* Sessions dialog */}
      {selectedUserForSessions && (
        <UserSessionsDialog
          open={isSessionsDialogOpen}
          onOpenChange={setIsSessionsDialogOpen}
          user={selectedUserForSessions}
          onSuccess={handleDialogSuccess}
        />
      )}
    </>
  );
}
