import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient()
  const { id } = await params

  const { data, error } = await supabase
    .from("event_members")
    .select(`
      *,
      user:users(id, display_name, email, avatar_url)
    `)
    .eq("event_id", id)
    .order("joined_at", { ascending: false })

  if (error) {
    console.error(error)
    return NextResponse.json({ error: "Lỗi khi lấy thành viên" }, { status: 500 })
  }

  return NextResponse.json(data)
}
