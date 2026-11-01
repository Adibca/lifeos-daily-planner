import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // If Supabase is configured, hook into persistent auth sessions
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Offline / Local Demo mode persistent session
      const savedUser = localStorage.getItem('lifeos_demo_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          // ignore
        }
      } else {
        // Default local user
        const defaultUser = {
          id: 'local-user-default',
          email: 'aditya@lifeos.local',
          user_metadata: { full_name: 'Aditya' }
        };
        setUser(defaultUser);
        localStorage.setItem('lifeos_demo_user', JSON.stringify(defaultUser));
      }
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (userId) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.warn('Profile fetch note:', err);
    }
  };

  const signInWithEmail = async (email, password) => {
    if (!isSupabaseConfigured() || !supabase) {
      // Simulate guest sign in
      const guest = { id: `user-${Date.now()}`, email, user_metadata: { full_name: email.split('@')[0] } };
      setUser(guest);
      localStorage.setItem('lifeos_demo_user', JSON.stringify(guest));
      return { success: true };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { success: true, data };
  };

  const signUpWithEmail = async (email, password, fullName) => {
    if (!isSupabaseConfigured() || !supabase) {
      const guest = { id: `user-${Date.now()}`, email, user_metadata: { full_name: fullName } };
      setUser(guest);
      localStorage.setItem('lifeos_demo_user', JSON.stringify(guest));
      return { success: true };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
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

