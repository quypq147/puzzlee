import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Lấy thông tin user hiện tại + profile trong bảng `profiles`
export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
  id: user.id,
  email: user.email,
  name: profile?.display_name || user.email?.split("@")[0],
    avatar: profile?.avatar_url ?? null,
  });
}
// Cập nhật thông tin hồ sơ (display_name, avatar_url)
export async function PATCH(req: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: any = {};
  try {
    payload = await req.json();
  } catch {
    // ignore
  }

  const { display_name, avatar_url } = payload ?? {};

  const updates: {
    id: string;
    display_name?: string;
    avatar_url?: string | null;
  } = { id: user.id };

  if (typeof display_name === "string") {
    updates.display_name = display_name.trim();
  }

  if (typeof avatar_url === "string" || avatar_url === null) {
    updates.avatar_url = avatar_url || null;
  }

  if (
    updates.display_name === undefined &&
    updates.avatar_url === undefined
  ) {
    return NextResponse.json(
      { error: "Không có dữ liệu để cập nhật" },
      { status: 400 },
    );
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert(updates, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: profile?.display_name || user.email?.split("@")[0],
    avatar: profile?.avatar_url ?? null,
  });
}
