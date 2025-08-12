import React from 'react';
import { useCurrentUserProfile } from '@/hooks/useUserManagement';

interface RoleGuardProps {
  allowedRoles: ('admin' | 'production')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { data: profile, isLoading } = useCurrentUserProfile();

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-4 w-20 rounded"></div>;
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function useHasRole(role: 'admin' | 'production'): boolean {
  const { data: profile } = useCurrentUserProfile();
  return profile?.role === role || false;
}

export function useIsAdmin(): boolean {
  return useHasRole('admin');
}