// app/api/events/[id]/members/manage/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// PATCH: Cập nhật Role (Thăng chức/Giáng chức)
export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createClient()
  const { id: eventId } = await params
  const { userId, role } = await req.json()

  // 1. Lấy thông tin người dùng hiện tại
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // 2. Kiểm tra quyền của người gọi API (Phải là ORGANIZER mới được set role)
  const { data: requesterMember } = await supabase
    .from("event_members")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single()

  if (requesterMember?.role !== 'ORGANIZER') {
    return NextResponse.json(
      { error: "Chỉ Ban tổ chức mới có quyền phân công vai trò" }, 
      { status: 403 }
    )
  }

  // 3. Thực hiện cập nhật
  const { error } = await supabase
    .from("event_members")
    .update({ role: role })
    .eq("event_id", eventId)
    .eq("user_id", userId)

  if (error) {
    console.error("Error updating role:", error)
    return NextResponse.json({ error: "Lỗi cập nhật vai trò" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// DELETE: Mời thành viên ra khỏi sự kiện (Kick)
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createClient()
  const { id: eventId } = await params
  const { userId } = await req.json()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // 2. Kiểm tra quyền (Organizer hoặc Moderator)
  const { data: requesterMember } = await supabase
    .from("event_members")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single()

  const allowedRoles = ['ORGANIZER', 'MODERATOR'];
  if (!allowedRoles.includes(requesterMember?.role)) {
    return NextResponse.json(
      { error: "Bạn không có quyền xóa thành viên" }, 
      { status: 403 }
    )
  }

  // 3. Thực hiện xóa
  const { error } = await supabase
    .from("event_members")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId)

  if (error) {
    return NextResponse.json({ error: "Lỗi khi xóa thành viên" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}