// lib/api/profile.ts
import { createClient } from "@/lib/supabase/server";

export async function getProfileById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getProfileByEmail(email: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*, auth_users:auth.users!inner(email)")
    .eq("auth_users.email", email)
    .single();

  if (error) throw error;
  return data;
}
