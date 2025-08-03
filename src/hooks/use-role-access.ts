import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useRoleAccess = (
  requiredRoles: string | string[],
  redirectTo: string = '/errors/403',
) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const rolesArray = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];
  const userRole = user?.role || 'user';
  const hasAccess = rolesArray.includes(userRole);

  useEffect(() => {
    if (!isLoading && user && !hasAccess) {
      router.replace(redirectTo);
    }
  }, [isLoading, user, hasAccess, router, redirectTo]);

  return {
    hasAccess,
    userRole,
    isLoading,
  };
};

/**
 * Hook specifically for admin access
 * @param redirectTo - Where to redirect if user is not admin
 */
export const useAdminAccess = (redirectTo: string = '/errors/403') => {
  return useRoleAccess('admin', redirectTo);
};
