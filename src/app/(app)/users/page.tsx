'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import UserPrimaryButton from './_components/user-primary-button';
import { UserTable } from './_components/user-table';
import { User } from '@/lib/types/user';
import UserFormDialog from './_components/user-form-dialog';
import { useAdminAccess } from '@/hooks/use-role-access';

export default function UsersPage() {
  const t = useTranslations('user.page');
  const { hasAccess, isLoading } = useAdminAccess();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Handle dialog reset on close - stabilize with useCallback
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
    }
  }, []);

  // Handle edit user - stabilize with useCallback
  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  }, []);

  // Handle operation success - stabilize with useCallback
  const handleSuccess = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedUser(null);
  }, []);

  // Show loading spinner while checking access
  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Access is handled by the hook redirect, so if we reach here, user has access
  if (!hasAccess) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <UserPrimaryButton
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          initialData={selectedUser || undefined}
          onSuccess={handleSuccess}
        />
      </div>

      <UserTable onEdit={handleEdit} onRefresh={handleSuccess} />

      {/* Additional UserFormDialog for editing */}
      {selectedUser && (
        <UserFormDialog
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          initialData={selectedUser}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
