'use server';

import { authClient } from '@/lib/auth-client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { UserService } from '@/lib/services/user.service';
import {
  User,
  UserPaginationParams,
  UserCreateData,
  UserRoleData,
  UserBanData,
  UserIdData,
  SessionData,
  UserSession,
  PermissionData,
  ImpersonateResult,
} from '@/lib/types/user';

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
 * Gets all users with pagination and filtering
 */
export async function getPaginatedUsers(params: UserPaginationParams) {
  try {
    // If using the external auth client API
    if (process.env.USE_AUTH_API === 'true') {
      const authHeaders = await getAuthHeaders();

      const result = await authClient.admin.listUsers({
        query: {
          limit: params?.pageSize || 10,
          sortBy: params?.sortField,
          sortDirection: params?.sortDirection,
        },
        fetchOptions: authHeaders,
      });

      if (result.data?.users) {
        return {
          success: true,
          data: result.data.users as User[],
          pagination: {
            totalCount: result.data.total || 0,
            totalPages: Math.ceil(
              (result.data.total || 0) / (params?.pageSize || 10),
            ),
            currentPage: params?.page || 1,
            pageSize: params?.pageSize || 10,
          },
        };
      }

      return {
        success: false,
        error: 'Failed to parse user data',
      };
    }

    // Use the local database via Prisma service
    const result = await UserService.getPaginated(params);

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      error: 'Failed to fetch users. Please try again.',
    };
  }
}
/**
 * Creates a new user
 */
export async function createUser(data: UserCreateData) {
  try {
    const authHeaders = await getAuthHeaders();

    const result = await authClient.admin.createUser(data, authHeaders);

    if ('data' in result && result.data?.user) {
      revalidatePath('/users');
      return { success: true, user: result.data.user };
    }

    return {
      success: false,
      error: 'Failed to create user. Invalid response.',
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: 'Failed to create user. Please try again.',
    };
  }
}

/**
 * Updates a user's role
 */
export async function setUserRole({ userId, role }: UserRoleData) {
  try {
    const authHeaders = await getAuthHeaders();

    const result = await authClient.admin.setRole(
      { userId, role },
      authHeaders,
    );

    if ('data' in result && result.data?.user) {
      revalidatePath('/users');
      return { success: true, user: result.data.user };
    }

    return {
      success: false,
      error: 'Failed to update user role. Invalid response.',
    };
  } catch (error) {
    console.error('Error updating user role:', error);
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
}: UserBanData) {
  try {
    const authHeaders = await getAuthHeaders();

    const result = await authClient.admin.banUser(
      { userId, banReason, banExpiresIn },
      authHeaders,
    );

    if ('data' in result && result.data?.user) {
      revalidatePath('/users');
      return { success: true, user: result.data.user };
    }

    return {
      success: false,
      error: 'Failed to ban user. Invalid response.',
    };
  } catch (error) {
    console.error('Error banning user:', error);
    return { success: false, error: 'Failed to ban user. Please try again.' };
  }
}

/**
 * Unbans a user
 */
export async function unbanUser({ userId }: UserIdData) {
  try {
    const authHeaders = await getAuthHeaders();

    const result = await authClient.admin.unbanUser({ userId }, authHeaders);

    if ('data' in result && result.data?.user) {
      revalidatePath('/users');
      return { success: true, user: result.data.user };
    }

    return {
      success: false,
      error: 'Failed to unban user. Invalid response.',
    };
  } catch (error) {
    console.error('Error unbanning user:', error);
    return { success: false, error: 'Failed to unban user. Please try again.' };
  }
}

/**
 * Removes a user
 */
export async function removeUser({ userId }: UserIdData) {
  try {
    const authHeaders = await getAuthHeaders();

    const result = await authClient.admin.removeUser({ userId }, authHeaders);

    if ('data' in result && result.data) {
      revalidatePath('/users');
      // The API returns a success boolean rather than a user object
      return { success: true };
    }

    return {
      success: false,
      error: 'Failed to remove user. Invalid response.',
    };
  } catch (error) {
    console.error('Error removing user:', error);
    return {
      success: false,
      error: 'Failed to remove user. Please try again.',
    };
  }
}

/**
 * Gets user sessions
 */
export async function getUserSessions({ userId }: UserIdData): Promise<{
  success: boolean;
  sessions?: UserSession[];
  error?: string;
}> {
  try {
    const authHeaders = await getAuthHeaders();

    const result = await authClient.admin.listUserSessions(
      { userId },
      authHeaders,
    );

    if ('data' in result) {
      // Handle different response formats
      const sessions = Array.isArray(result.data)
        ? result.data
        : result.data?.sessions || [];

      // Map the API response to our UserSession interface
      const formattedSessions = sessions.map((session) => ({
        id: session.id,
        userId: session.userId,
        expiresAt:
          session.expiresAt instanceof Date
            ? session.expiresAt.toISOString()
            : String(session.expiresAt),
        sessionToken: session.token,
        lastActiveAt:
          session.lastActiveAt instanceof Date
            ? session.lastActiveAt.toISOString()
            : session.updatedAt instanceof Date
            ? session.updatedAt.toISOString()
            : session.createdAt instanceof Date
            ? session.createdAt.toISOString()
            : new Date().toISOString(),
        createdAt:
          session.createdAt instanceof Date
            ? session.createdAt.toISOString()
            : new Date().toISOString(),
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        current: session.current || false,
      }));

      return { success: true, sessions: formattedSessions };
    }

    return {
      success: false,
      error: 'Failed to fetch user sessions. Invalid response.',
    };
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return {
      success: false,
      error: 'Failed to fetch user sessions. Please try again.',
    };
  }
}

/**
 * Revokes a user session
 */
export async function revokeUserSession({ sessionToken }: SessionData) {
  try {
    const authHeaders = await getAuthHeaders();

    await authClient.admin.revokeUserSession({ sessionToken }, authHeaders);
    return { success: true };
  } catch (error) {
    console.error('Error revoking user session:', error);
    return {
      success: false,
      error: 'Failed to revoke session. Please try again.',
    };
  }
}

/**
 * Revokes all sessions for a user
 */
export async function revokeAllUserSessions({ userId }: UserIdData) {
  try {
    const authHeaders = await getAuthHeaders();

    await authClient.admin.revokeUserSessions({ userId }, authHeaders);
    return { success: true };
  } catch (error) {
    console.error('Error revoking all user sessions:', error);
    return {
      success: false,
      error: 'Failed to revoke all sessions. Please try again.',
    };
  }
}

/**
 * Checks if the current user has specific permissions
 */
export async function checkPermission(permission: PermissionData) {
  try {
    const authHeaders = await getAuthHeaders();

    const hasPermission = await authClient.admin.hasPermission(
      { permission },
      authHeaders,
    );
    return { success: true, hasPermission };
  } catch (error) {
    console.error('Error checking permission:', error);
    return { success: false, error: 'Failed to check permission.' };
  }
}

/**
 * Impersonates a user
 */
export async function impersonateUser({ userId }: UserIdData) {
  try {
    const authHeaders = await getAuthHeaders();

    const result = await authClient.admin.impersonateUser(
      { userId },
      authHeaders,
    );

    if ('data' in result && result.data) {
      // Cast the result to unknown first, then to our interface
      return {
        success: true,
        session: result.data as ImpersonateResult,
      };
    }

    return {
      success: false,
      error: 'Failed to impersonate user. Invalid response.',
    };
  } catch (error) {
    console.error('Error impersonating user:', error);
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
    console.error('Error stopping impersonation:', error);
    return {
      success: false,
      error: 'Failed to stop impersonating. Please try again.',
    };
  }
}
