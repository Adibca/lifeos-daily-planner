import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;

          if (mounted) {
            setUser(session?.user ?? null);
            if (session?.user) {
              await fetchProfile(session.user.id);
            }
          }
        } catch (err) {
          console.warn('[Auth] Session check notice:', err);
        } finally {
          if (mounted) setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!mounted) return;
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
          setLoading(false);
        });

        return () => subscription.unsubscribe();
      } else {
        // Fallback demo mode when Supabase credentials are not configured yet
        const savedUser = localStorage.getItem('lifeos_demo_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            // ignore
          }
        }
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchProfile = async (userId) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.warn('Profile fetch note:', err);
    }
  };

  const signInWithEmail = async (email, password) => {
    setAuthError(null);
    if (!isSupabaseConfigured() || !supabase) {
      const guest = { 
        id: `guest-${Date.now()}`, 
        email, 
        user_metadata: { full_name: email.split('@')[0] } 
      };
      setUser(guest);
      localStorage.setItem('lifeos_demo_user', JSON.stringify(guest));
      return { success: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password 
    });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    setUser(data.user);
    if (data.user) {
      await fetchProfile(data.user.id);
    }
    return { success: true, data };
  };

  const signUpWithEmail = async (email, password, fullName) => {
    setAuthError(null);
    if (!isSupabaseConfigured() || !supabase) {
      const guest = { 
        id: `guest-${Date.now()}`, 
        email, 
        user_metadata: { full_name: fullName || email.split('@')[0] } 
      };
      setUser(guest);
      localStorage.setItem('lifeos_demo_user', JSON.stringify(guest));
      return { success: true };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName }
      }
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    setUser(data.user);
    if (data.user) {
      await fetchProfile(data.user.id);
    }
    return { success: true, data };
  };

  const signOut = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('lifeos_demo_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authError,
        isAuthModalOpen,
        setIsAuthModalOpen,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        isConfigured: isSupabaseConfigured(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
