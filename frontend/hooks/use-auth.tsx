// hooks/use-auth.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  first_name: string | null;
  second_name: string | null;
  avatar_url: string | null;
  username?: string | null;
  role: string | null;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session ?? null);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, second_name, avatar_url, username")
        .eq("id", userId)
        .single();
      if (!error && data) {
        const row = data as {
          id: string;
          first_name: string | null;
          second_name: string | null;
          avatar_url: string | null;
          username: string | null;
        };
        const p: Profile = {
          id: row.id,
          first_name: row.first_name ?? null,
          second_name: row.second_name ?? null,
          avatar_url: row.avatar_url ?? null,
          username: row.username ?? null,
          role: null,
        };
        setProfile(p);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
