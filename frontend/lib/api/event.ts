import { createClient } from "@/lib/supabase/server";


export async function getEventById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Lỗi khi truy vấn event theo id:", error);
    return null;
  }

  return data;
}
