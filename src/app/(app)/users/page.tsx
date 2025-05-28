'use client';

import { useState } from 'react';
import UserPrimaryButton from './_components/user-primary-button';
import { UserTable } from './_components/user-table';
import { User } from '@/lib/types/user';
import UserFormDialog from './_components/user-form-dialog';

export default function UsersPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Handle dialog reset on close
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
    }
  };

  // Handle edit user
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  // Handle operation success
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
    handleRefresh();
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Users</h2>
          <p className="text-muted-foreground">
            Create and manage user accounts.
          </p>
        </div>
        <UserPrimaryButton
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          initialData={selectedUser || undefined}
          onSuccess={handleSuccess}
        />
      </div>

      <UserTable
        key={`user-table-${refreshTrigger}`}
        onEdit={handleEdit}
        onRefresh={handleRefresh}
      />

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
