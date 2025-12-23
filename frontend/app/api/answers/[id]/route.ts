import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = createClient()
  const { id } = await context.params

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verify user is answer author or event organizer
  const { data: answer } = await supabase.from("answers").select("user_id, question_id").eq("id", id).single()

  if (!answer) {
    return NextResponse.json({ error: "Answer not found" }, { status: 404 })
  }

  if (answer.user_id !== user.id) {
    return NextResponse.json({ error: "You can only delete your own answers" }, { status: 403 })
  }

  const { error } = await supabase.from("answers").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: "Failed to delete answer" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
