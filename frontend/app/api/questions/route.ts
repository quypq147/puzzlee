import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const revalidate = 0;

// Cập nhật Schema để nhận type và options
const questionSchema = z.object({
  event_id: z.string().min(1),
  content: z.string().min(1),
  is_anonymous: z.boolean().optional(),
  type: z.enum(['qa', 'poll', 'quiz']).optional().default('qa'), // Thêm type
  options: z.array(z.object({
    content: z.string(),
    is_correct: z.boolean().optional()
  })).optional() // Thêm options
});

async function resolveEventId(supabase: any, idOrCode: string) {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrCode);
  if (isUUID) return idOrCode;

  const { data } = await supabase
    .from("events")
    .select("id")
    .eq("code", idOrCode.toUpperCase())
    .single();

  return data?.id || null;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = questionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const finalEventId = await resolveEventId(supabase, parsed.data.event_id);
  
  if (!finalEventId) {
    return NextResponse.json({ error: "Invalid Event ID or Code" }, { status: 404 });
  }

  // 1. Insert Câu hỏi vào bảng questions
  const { data: questionData, error: questionError } = await supabase
    .from("questions")
    .insert({ 
      content: parsed.data.content,
      event_id: finalEventId, 
      author_id: user.id,
      is_anonymous: parsed.data.is_anonymous || false,
      type: parsed.data.type // [FIX] Lưu loại câu hỏi
    })
    .select("*, profiles:author_id(full_name, avatar_url)")
    .single();

  if (questionError) return NextResponse.json({ error: questionError.message }, { status: 500 });

  // 2. [FIX] Nếu là Poll/Quiz, Insert các lựa chọn vào bảng question_options
  if (['poll', 'quiz'].includes(parsed.data.type) && parsed.data.options && parsed.data.options.length > 0) {
    const optionsToInsert = parsed.data.options.map((opt, index) => ({
      question_id: questionData.id, // ID của câu hỏi vừa tạo
      content: opt.content,
      is_correct: opt.is_correct || false,
      order_index: index
    }));

    const { error: optionError } = await supabase
      .from("question_options")
      .insert(optionsToInsert);

    if (optionError) {
      // Nếu lỗi lưu options, có thể cân nhắc xoá câu hỏi hoặc log lỗi
      console.error("Error inserting options:", optionError);
      return NextResponse.json({ error: "Created question but failed to save options" }, { status: 500 });
    }
  }

  return NextResponse.json(questionData, { status: 201 });
}

// ... Giữ nguyên phần GET ...
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const eventIdParam = searchParams.get("event_id");
  const typeParam = searchParams.get("type");

  if (!eventIdParam) {
    return NextResponse.json({ error: "Missing event_id" }, { status: 400 });
  }

  const finalEventId = await resolveEventId(supabase, eventIdParam);

  if (!finalEventId) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  let query = supabase
    .from("questions")
    .select(`
      *, 
      profiles:author_id(first_name , second_name , username, avatar_url),
      question_options(*) 
    `) // [FIX] Fetch thêm options để hiển thị ở frontend
    .eq("event_id", finalEventId)
    .order("created_at", { ascending: false });

  if (typeParam && ['qa', 'poll', 'quiz'].includes(typeParam)) {
    query = query.eq("type", typeParam);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}