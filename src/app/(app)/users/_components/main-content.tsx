'use client';

import { useState, useEffect } from 'react';
import { getUsers } from '../action';
import UserPrimaryButton from './user-primary-button';
import { UserTable } from './user-table';

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role: string;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  username: string | null;
  displayUsername: string | null;
};

export default function MainContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers();

      if (response.success && response.users) {
        if ('users' in response.users) {
          setUsers(response.users.users as User[]);
        } else {
          setUsers(response.users as unknown as User[]);
        }
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
    fetchUsers();
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
        data={users}
        isLoading={isLoading}
        onEdit={handleEdit}
        onRefresh={fetchUsers}
      />
    </div>
  );
}
