// app/api/questions/[id]/moderate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const { action } = await req.json();

  // Validate User & Permission (Host/Moderator) ở đây...

  let updateData: any = {};
  switch (action) {
    case 'pin':
      // Unpin các câu khác nếu muốn chỉ 1 câu được pin
      // await supabase.from('questions').update({ is_pinned: false }).eq('event_id', ...);
      updateData = { is_pinned: true }; 
      break;
    case 'unpin':
      updateData = { is_pinned: false };
      break;
    case 'hide':
      updateData = { status: 'HIDDEN' };
      break;
    case 'show':
      updateData = { status: 'VISIBLE' };
      break;
    case 'answer':
      updateData = { is_answered: true };
      break;
  }

  const { data, error } = await supabase
    .from("questions")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}