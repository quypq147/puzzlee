import { createClient } from "@/lib/supabase/server";

export async function getUserById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();
    if (error) {
        throw error;
    }
    return data;
}
export async function getUserByEmail(email: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
    if (error) {
        throw error;
    }
    return data;
}
