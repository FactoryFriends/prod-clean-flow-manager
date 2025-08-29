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
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: any }>;
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
        
        // Load real profile from database
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data, error } = await supabase.rpc('get_current_user_profile', {
                p_user_id: session.user.id
              });
              
              if (data && data.length > 0) {
                setProfile(data[0]);
              } else {
                setProfile(null);
              }
            } catch (error) {
              console.error('Error loading user profile:', error);
              setProfile(null);
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const { data, error } = await supabase.rpc('get_current_user_profile', {
            p_user_id: session.user.id
          });
          
          if (data && data.length > 0) {
            setProfile(data[0]);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          setProfile(null);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const resetPasswordForEmail = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile to check extended_session setting
      if (data.user) {
        const { data: profileData } = await supabase
          .rpc('get_current_user_profile' as any, { p_user_id: data.user.id });
        
        const profile = profileData && profileData.length > 0 ? profileData[0] : null;
        
        // Configure session duration based on user's extended_session setting
        if (profile?.extended_session) {
          sessionManager.setDevicePreference(true);
          sessionManager.setSessionMetadata({
            extended_session: true,
            user_id: data.user.id,
            expires_at: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year
          });
        } else {
          sessionManager.setDevicePreference(false);
          sessionManager.setSessionMetadata({
            extended_session: false,
            user_id: data.user.id,
            expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
          });
        }
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error };
    }
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
    signIn,
    signOut,
    resetPasswordForEmail,
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