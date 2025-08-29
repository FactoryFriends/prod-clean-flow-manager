import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/hooks/useUserManagement';
import { sessionManager } from '@/utils/sessionManager';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string, role?: 'admin' | 'production') => Promise<{ error: any }>;
  signIn: (email: string, password: string, rememberDevice?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Create temporary profile for demo purposes
        if (session?.user) {
          setProfile({
            id: 'temp-profile-id',
            user_id: session.user.id,
            role: 'admin', // Temporary default role
            full_name: session.user.user_metadata?.full_name || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: null
          } as UserProfile);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setProfile({
          id: 'temp-profile-id',
          user_id: session.user.id,
          role: 'admin', // Temporary default role
          full_name: session.user.user_metadata?.full_name || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null
        } as UserProfile);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, role?: 'admin' | 'production') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role || 'production'
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string, rememberDevice = false) => {
    // Store device preference before signing in
    sessionManager.setDevicePreference(rememberDevice);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error && rememberDevice) {
      // Store session metadata for long-term sessions
      sessionManager.setSessionMetadata({
        email,
        loginTime: new Date().toISOString(),
        longTerm: true
      });
    }
    
    return { error };
  };

  const signOut = async () => {
    // Clear all session data on signout
    sessionManager.clearAll();
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}