import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { content, is_pinned, status } = body;

  // 2. Lấy câu hỏi cũ để kiểm tra quyền sở hữu
  const { data: question } = await supabase
    .from("questions")
    .select("author_id")
    .eq("id", id)
    .single();

  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  // 3. Logic phân quyền đơn giản: Chỉ tác giả mới được sửa nội dung
  if (question.author_id !== user.id) {
    // Nếu bạn có logic Admin/Mod, hãy thêm điều kiện OR ở đây
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Thực hiện Update
  const updateData: any = {};
  if (content !== undefined) updateData.content = content;
  // Các trường như is_pinned, status thường dành cho Moderator, 
  // tạm thời cho phép update nếu request gửi lên (bạn có thể chặn lại nếu muốn)
  if (is_pinned !== undefined) updateData.is_pinned = is_pinned;
  if (status !== undefined) updateData.status = status;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("questions")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Kiểm tra quyền sở hữu
  const { data: question } = await supabase
    .from("questions")
    .select("author_id")
    .eq("id", id)
    .single();

  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (question.author_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Xóa (Các bảng con như answers, votes nên được setup ON DELETE CASCADE trong DB)
  // Nếu DB chưa có CASCADE, bạn cần xóa các bảng con trước.
  const { error } = await supabase.from("questions").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Deleted successfully" });
}