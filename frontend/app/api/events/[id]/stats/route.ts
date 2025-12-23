import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient()
  const { id } = await params

  // Get question count
  const { count: questionCount } = await supabase.from("questions").select("*", { count: "exact" }).eq("event_id", id)

  // Get answer count
  const { count: answerCount } = await supabase
    .from("answers")
    .select(
      `
      id,
      question_id
    `,
      { count: "exact" },
    )
    .in("question_id", (await supabase.from("questions").select("id").eq("event_id", id)).data?.map((q) => q.id) || [])

  // Get member count
  const { count: memberCount } = await supabase.from("event_members").select("*", { count: "exact" }).eq("event_id", id)

  return NextResponse.json({
    event_id: id,
    question_count: questionCount || 0,
    answer_count: answerCount || 0,
    member_count: memberCount || 0,
  })
}
