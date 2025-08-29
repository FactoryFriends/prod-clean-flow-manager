import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if we're already on the auth page or still loading
    if (loading || location.pathname === '/auth') return;
    
    // Redirect to auth if no user is authenticated
    if (!user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate, location.pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  // Don't render content if user is not authenticated (will redirect)
  if (!user && location.pathname !== '/auth') {
    return null;
  }

  return <>{children}</>;
}