import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { question_id, content } = await req.json()

  if (!question_id || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("answers")
    .insert({
      question_id,
      user_id: user.id,
      content,
    })
    .select(`
      *,
      user:users(id, display_name, avatar_url)
    `)
    .single()

  if (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create answer" }, { status: 500 })
  }

  // Update question answer count
  await supabase
    .from("questions")
    .update({ answer_count: (data.answer_count || 0) + 1 })
    .eq("id", question_id)

  return NextResponse.json(data)
}
