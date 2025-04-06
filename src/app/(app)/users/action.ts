'use server';

import { authClient } from '@/lib/auth-client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

/**
 * Helper function to get cookie headers for authenticated requests
 */
async function getAuthHeaders() {
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();

  return {
    headers: {
      Cookie: cookieString,
    },
  };
}

/**
 * Gets all users
 */
export async function getUsers(query?: {
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}) {
  try {
    const authHeaders = await getAuthHeaders();

    const result = await authClient.admin.listUsers({
      query: {
        limit: query?.limit || 10,
        sortBy: query?.sortBy,
        sortDirection: query?.sortDirection,
      },
      fetchOptions: authHeaders,
    });

    if (result.data?.users) {
      return {
        success: true,
        users: result.data.users,
        total: result.data.total || 0,
      };
    }

    // Fallback if structure is different
    return {
      success: false,
      error: 'Failed to parse user data',
    };
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return {
      success: false,
      error: 'Failed to fetch users. Please try again.',
    };
  }
}

/**
 * Creates a new user
 */
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  data?: Record<string, any>;
}) {
  try {
    const authHeaders = await getAuthHeaders();

    const result = await authClient.admin.createUser(data, authHeaders);
    revalidatePath('/users');
    return { success: true, user: result };
  } catch (error) {
    console.error('Failed to create user:', error);
    return {
      success: false,
      error: 'Failed to create user. Please try again.',
    };
  }
}

/**
 * Updates a user's role
 */
export async function setUserRole({
  userId,
  role,
}: {
  userId: string;
  role: string;
}) {
  try {
    const authHeaders = await getAuthHeaders();

    const result = await authClient.admin.setRole(
      { userId, role },
      authHeaders,
    );
    revalidatePath('/users');
    return { success: true, user: result };
  } catch (error) {
    console.error('Failed to update user role:', error);
    return {
      success: false,
      error: 'Failed to update user role. Please try again.',
    };
  }
}

/**
 * Bans a user
 */
export async function banUser({
  userId,
  banReason,
  banExpiresIn,
}: {
  userId: string;
  banReason?: string;
  banExpiresIn?: number;
}) {
  try {
    const authHeaders = await getAuthHeaders();

    const result = await authClient.admin.banUser(
      { userId, banReason, banExpiresIn },
      authHeaders,
    );
    revalidatePath('/users');
    return { success: true, user: result };
  } catch (error) {
    console.error('Failed to ban user:', error);
    return { success: false, error: 'Failed to ban user. Please try again.' };
  }
}

/**
 * Unbans a user
 */
export async function unbanUser({ userId }: { userId: string }) {
  try {
    const authHeaders = await getAuthHeaders();

    const result = await authClient.admin.unbanUser({ userId }, authHeaders);
    revalidatePath('/users');
    return { success: true, user: result };
  } catch (error) {
    console.error('Failed to unban user:', error);
    return { success: false, error: 'Failed to unban user. Please try again.' };
  }
}

/**
 * Removes a user
 */
export async function removeUser({ userId }: { userId: string }) {
  try {
    const authHeaders = await getAuthHeaders();

    const result = await authClient.admin.removeUser({ userId }, authHeaders);
    revalidatePath('/users');
    return { success: true, user: result };
  } catch (error) {
    console.error('Failed to remove user:', error);
    return {
      success: false,
      error: 'Failed to remove user. Please try again.',
    };
  }
}

/**
 * Gets user sessions
 */
export async function getUserSessions({ userId }: { userId: string }) {
  try {
    const authHeaders = await getAuthHeaders();

    const sessions = await authClient.admin.listUserSessions(
      { userId },
      authHeaders,
    );
    return { success: true, sessions };
  } catch (error) {
    console.error('Failed to fetch user sessions:', error);
    return {
      success: false,
      error: 'Failed to fetch user sessions. Please try again.',
    };
  }
}

/**
 * Revokes a user session
 */
export async function revokeUserSession({
  sessionToken,
}: {
  sessionToken: string;
}) {
  try {
    const authHeaders = await getAuthHeaders();

    await authClient.admin.revokeUserSession({ sessionToken }, authHeaders);
    return { success: true };
  } catch (error) {
    console.error('Failed to revoke session:', error);
    return {
      success: false,
      error: 'Failed to revoke session. Please try again.',
    };
  }
}

/**
 * Revokes all sessions for a user
 */
export async function revokeAllUserSessions({ userId }: { userId: string }) {
  try {
    const authHeaders = await getAuthHeaders();

    await authClient.admin.revokeUserSessions({ userId }, authHeaders);
    return { success: true };
  } catch (error) {
    console.error('Failed to revoke all sessions:', error);
    return {
      success: false,
      error: 'Failed to revoke all sessions. Please try again.',
    };
  }
}

/**
 * Checks if the current user has specific permissions
 */
export async function checkPermission(permission: Record<string, string[]>) {
  try {
    const authHeaders = await getAuthHeaders();

    const hasPermission = await authClient.admin.hasPermission(
      { permission },
      authHeaders,
    );
    return { success: true, hasPermission };
  } catch (error) {
    console.error('Failed to check permission:', error);
    return { success: false, error: 'Failed to check permission.' };
  }
}

/**
 * Impersonates a user
 */
export async function impersonateUser({ userId }: { userId: string }) {
  try {
    const authHeaders = await getAuthHeaders();

    const result = await authClient.admin.impersonateUser(
      { userId },
      authHeaders,
    );
    return { success: true, session: result };
  } catch (error) {
    console.error('Failed to impersonate user:', error);
    return {
      success: false,
      error: 'Failed to impersonate user. Please try again.',
    };
  }
}

/**
 * Stops impersonating a user
 */
export async function stopImpersonating() {
  try {
    await authClient.admin.stopImpersonating();
    return { success: true };
  } catch (error) {
    console.error('Failed to stop impersonating:', error);
    return {
      success: false,
      error: 'Failed to stop impersonating. Please try again.',
    };
  }
}
