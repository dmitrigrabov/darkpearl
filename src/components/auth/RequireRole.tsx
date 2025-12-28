import { ReactNode } from 'react';
import { useAuth, type UserRole } from '@/providers/AuthProvider';

interface RequireRoleProps {
  role: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on user's role.
 * Use this to hide/show entire sections of UI based on role.
 */
export function RequireRole({ role, children, fallback = null }: RequireRoleProps) {
  const { role: userRole } = useAuth();

  const roles = Array.isArray(role) ? role : [role];
  const hasRole = roles.includes(userRole);

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Only renders children if user is an admin
 */
export function RequireAdmin({ children, fallback }: Omit<RequireRoleProps, 'role'>) {
  return (
    <RequireRole role="admin" fallback={fallback}>
      {children}
    </RequireRole>
  );
}

/**
 * Only renders children if user is admin or manager
 */
export function RequireAdminOrManager({ children, fallback }: Omit<RequireRoleProps, 'role'>) {
  return (
    <RequireRole role={['admin', 'manager']} fallback={fallback}>
      {children}
    </RequireRole>
  );
}

interface CanProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Only renders children if user can create resources
 */
export function CanCreate({ children, fallback = null }: CanProps) {
  const { canCreate } = useAuth();
  return canCreate ? <>{children}</> : <>{fallback}</>;
}

/**
 * Only renders children if user can update resources
 */
export function CanUpdate({ children, fallback = null }: CanProps) {
  const { canUpdate } = useAuth();
  return canUpdate ? <>{children}</> : <>{fallback}</>;
}

/**
 * Only renders children if user can delete resources
 */
export function CanDelete({ children, fallback = null }: CanProps) {
  const { canDelete } = useAuth();
  return canDelete ? <>{children}</> : <>{fallback}</>;
}
