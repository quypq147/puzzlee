import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

export const revalidate = 0

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  is_active: z.boolean().optional(),
})

// GET /api/events → list events for current user
export async function GET(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const isActiveParam = searchParams.get("is_active")
  const startsAfter = searchParams.get("starts_after")
  const startsBefore = searchParams.get("starts_before")

  // Fetch events created by the user
  let createdQuery = supabase.from("events").select("*").eq("created_by", user.id)
  if (isActiveParam === "true" || isActiveParam === "false") {
    createdQuery = createdQuery.eq("is_active", isActiveParam === "true")
  }
  if (startsAfter) {
    createdQuery = createdQuery.gte("start_time", startsAfter)
  }
  if (startsBefore) {
    createdQuery = createdQuery.lte("start_time", startsBefore)
  }
  const { data: createdEvents, error: createdError } = await createdQuery

  if (createdError) {
    console.error("/api/events GET createdError:", createdError)
    return NextResponse.json({ error: createdError.message }, { status: 500 })
  }

  // Fetch events where the user is a member
  const { data: memberships, error: memberError } = await supabase
    .from("event_members")
    .select("event_id")
    .eq("user_id", user.id)

  if (memberError) {
    console.error("/api/events GET memberError:", memberError)
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  let joinedEvents: any[] = []
  const eventIds = (memberships ?? []).map((m: any) => m.event_id)
  if (eventIds.length > 0) {
    let joinedQuery = supabase.from("events").select("*").in("id", eventIds)
    if (isActiveParam === "true" || isActiveParam === "false") {
      joinedQuery = joinedQuery.eq("is_active", isActiveParam === "true")
    }
    if (startsAfter) {
      joinedQuery = joinedQuery.gte("start_time", startsAfter)
    }
    if (startsBefore) {
      joinedQuery = joinedQuery.lte("start_time", startsBefore)
    }
    const { data: eventsByMembership, error: eventsByMembershipError } = await joinedQuery

    if (eventsByMembershipError) {
      console.error("/api/events GET eventsByMembershipError:", eventsByMembershipError)
      return NextResponse.json({ error: eventsByMembershipError.message }, { status: 500 })
    }
    joinedEvents = eventsByMembership ?? []
  }

  // Merge and deduplicate by id
  const byId: Record<string, any> = {}
  for (const e of [...(createdEvents ?? []), ...joinedEvents]) {
    if (e?.id) byId[e.id] = e
  }

  return NextResponse.json(Object.values(byId))
}

// POST /api/events → create event
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Không được phép" }, { status: 401 })

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Dữ liệu JSON không hợp lệ" }, { status: 400 })
  }

  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  // Insert-first with retry on unique violation (RLS-safe)
  let eventData: any = null
  let attempt = 0

  while (attempt < 5) {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase()

    const { data, error }: { data: any; error: any } = await supabase
      .from("events")
      .insert({ ...parsed.data, created_by: user.id, code })
      .select("*")
      .single()

    if (!error) {
      eventData = data
      break
    }

    const message: string = error?.message || ""
    const pgCode: string | undefined = error?.code
    const isUniqueViolation = pgCode === "23505" || /duplicate key|unique constraint/i.test(message)

    if (isUniqueViolation) {
      attempt++
      continue
    }

    return NextResponse.json({ error: message || "Lỗi tạo sự kiện" }, { status: 500 })
  }

  if (!eventData) {
    return NextResponse.json({ error: "Không thể tạo mã sự kiện sau nhiều lần thử. Vui lòng thử lại." }, { status: 500 })
  }

  return NextResponse.json(eventData, { status: 201 })
}

// PATCH /api/events → update event (creator only)
export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { id, ...rest } = body || {}
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing 'id'" }, { status: 400 })
  }

  // Only allow updating fields defined in schema
  const partialSchema = eventSchema.partial()
  const parsed = partialSchema.safeParse(rest)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Verify ownership
  const { data: event, error: fetchErr } = await supabase
    .from("events")
    .select("id, created_by")
    .eq("id", id)
    .single()

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 404 })
  }
  if (event?.created_by !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("events")
    .update({ ...parsed.data })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

// DELETE /api/events → delete event (creator only)
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing 'id'" }, { status: 400 })

  const { data: event, error: fetchErr } = await supabase
    .from("events")
    .select("id, created_by")
    .eq("id", id)
    .single()

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 404 })
  }
  if (event?.created_by !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}



