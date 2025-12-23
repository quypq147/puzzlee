import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { question_id, answer_id, content } = await req.json()

  if (!content || (!question_id && !answer_id)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      question_id: question_id || null,
      answer_id: answer_id || null,
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
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(req.url)
  const question_id = searchParams.get("question_id")
  const answer_id = searchParams.get("answer_id")

  let query = supabase.from("comments").select(`
      *,
      user:users(id, display_name, avatar_url)
    `)

  if (question_id) {
    query = query.eq("question_id", question_id)
  } else if (answer_id) {
    query = query.eq("answer_id", answer_id)
  } else {
    return NextResponse.json({ error: "Missing question_id or answer_id" }, { status: 400 })
  }

  const { data, error } = await query.order("created_at", { ascending: true })

  if (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }

  return NextResponse.json(data)
}
