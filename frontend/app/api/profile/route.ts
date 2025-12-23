import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export const revalidate = 0

const updateSchema = z.object({
  display_name: z.string().min(1).max(200).optional(),
  full_name: z.string().min(1).max(200).optional(),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_\.\-]+$/)
    .optional(),
  avatar_url: z.string().url().nullable().optional(),
  background_url: z.string().url().nullable().optional(),
})

// GET /api/profile → returns current user's profile snapshot
export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, username, full_name, background_url")
    .eq("id", user.id)
    .maybeSingle()

  // Handle RLS or not found gracefully
  if (error && error.code !== "PGRST116") {
    // PGRST116: No rows found for .single(), not fatal for maybeSingle
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    id: user.id,
    email: user.email ?? null,
    display_name: data?.display_name ?? null,
    avatar_url: data?.avatar_url ?? null,
    username: data?.username ?? null,
    full_name: data?.full_name ?? null,
    background_url: data?.background_url ?? null,
  })
}

// PATCH /api/profile → updates current user's profile
export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Không được phép" }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Sai định dạng JSON" }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const update = parsed.data
  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "Không thay đổi" }, { status: 400 })
  }

  // If username provided, enforce uniqueness
  if (update.username) {
    const { data: existing, error: usernameErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", update.username)
      .neq("id", user.id)
      .maybeSingle()
    if (usernameErr) {
      return NextResponse.json({ error: "Không thể kiểm tra username" }, { status: 500 })
    }
    if (existing) {
      return NextResponse.json({ error: "Username đã tồn tại" }, { status: 409 })
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
