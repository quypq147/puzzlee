import { createClient } from "@/lib/supabase/server";

export async function getEventByCode(code : string)
{
    const supabase = createClient();    
    return supabase.from('events').select('*').eq('code', code).single();
}
