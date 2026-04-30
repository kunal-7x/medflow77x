// MedFlow Auth - Using Supabase
import { supabase } from "../supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export const auth = {
  signInWithOAuth: async (provider: "google" | "apple" | "microsoft") => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { data, error, redirected: !!data?.url };
  },
  
  signInWithPassword: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },
  
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
  
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { session: data?.session || null, error };
  },
  
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default auth;