import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Join an event by code
 * body: { code: string }
 */
export async function POST(req: Request) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const code = body.code?.trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, code, title, description, created_by")
    .eq("code", code)
    .limit(1)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Optionally upsert participant membership
  const { error: membershipError } = await supabase
    .from("event_participants")
    .upsert(
      { event_id: event.id, user_id: user.id },
      { onConflict: "event_id,user_id", ignoreDuplicates: true }
    );

  if (membershipError) {
    // Non-fatal for joining; log and continue
    console.error("[join] upsert participant failed:", membershipError);
  }

  return NextResponse.json({ event });
}

