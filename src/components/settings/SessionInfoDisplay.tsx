import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, Shield, User } from "lucide-react";
import { useCurrentUserProfile } from '@/hooks/useUserManagement';

export function SessionInfoDisplay() {
  const { data: profile, isLoading } = useCurrentUserProfile();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-pulse bg-muted h-4 w-20 rounded"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'} className="flex items-center gap-1">
        {profile.role === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
        {profile.role === 'admin' ? 'Admin' : 'Production'}
      </Badge>
      <Badge variant={profile.extended_session ? 'default' : 'secondary'} className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Session: {profile.extended_session ? '1 Year' : '24 Hours'}
      </Badge>
    </div>
  );
}