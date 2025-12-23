import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const revalidate = 0;

// Schema validation: Đổi 'status' thành 'is_active' để khớp với Database
const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(), // <--- SỬA LẠI DÒNG NÀY
});

// GET /api/events/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient(); // <--- BẮT BUỘC AWAIT
    const { id } = await params;

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/events/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient(); // <--- BẮT BUỘC AWAIT
    const { id } = await params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate dữ liệu đầu vào
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Nếu object rỗng thì return luôn, không gọi DB để tránh lỗi syntax SQL
    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ message: "Nothing to update" }, { status: 200 });
    }

    // Update vào DB
    const { data, error } = await supabase
      .from("events")
      .update(parsed.data) // Lúc này parsed.data chứa is_active, không phải status
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase Patch Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Server Patch Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
