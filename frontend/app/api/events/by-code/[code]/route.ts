import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 401 });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code } = await params;

    const { data: event, error }: { data: any; error: any } = await supabase
      .from("events")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: error?.message ?? "Not found" }, { status: 404 });
    }

    // Owner-only access for dashboard; extend as needed for members
    if (event.created_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const shaped = {
      ...event,
      event_code: event.code,
      status: event.status ?? (event.is_active ? "active" : "inactive"),
    } as const;

    return NextResponse.json(shaped);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
