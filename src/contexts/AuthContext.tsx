import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'doctor' | 'nurse' | 'receptionist';

const VISITOR_KEY = 'medflow_visitor';

interface VisitorProfile {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  isVisitor: boolean;
  visitorProfile: VisitorProfile | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  continueAsVisitor: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredVisitor(): VisitorProfile | null {
  try {
    const stored = sessionStorage.getItem(VISITOR_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisitor, setIsVisitor] = useState(false);
  const [visitorProfile, setVisitorProfile] = useState<VisitorProfile | null>(null);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase.rpc('get_user_role', { _user_id: userId });
    if (data) {
      setRole(data as AppRole);
    } else {
      setRole(null);
    }
  };

  // Check for existing visitor session on mount
  useEffect(() => {
    const stored = getStoredVisitor();
    if (stored) {
      setVisitorProfile(stored);
      setIsVisitor(true);
      setRole(stored.role);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If visitor, skip Supabase auth
    if (isVisitor) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchRole(session.user.id), 0);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isVisitor]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, fullName: string, role: AppRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin
      }
    });

    if (error) return { error: error.message };

    if (data.user) {
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: role
      });
      if (roleError) return { error: roleError.message };
    }

    return { error: null };
  };

  const continueAsVisitor = () => {
    const profile: VisitorProfile = {
      id: 'visitor-' + Date.now(),
      email: 'visitor@medflow.demo',
      full_name: 'Guest Visitor',
      role: 'admin', // Give full access to explore
    };
    sessionStorage.setItem(VISITOR_KEY, JSON.stringify(profile));
    setVisitorProfile(profile);
    setIsVisitor(true);
    setRole(profile.role);
    setLoading(false);
  };

  const signOut = async () => {
    if (isVisitor) {
      sessionStorage.removeItem(VISITOR_KEY);
      setVisitorProfile(null);
      setIsVisitor(false);
    } else {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, isVisitor, visitorProfile, signIn, signUp, signOut, continueAsVisitor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
