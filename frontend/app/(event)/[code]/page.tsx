import { notFound } from "next/navigation";
import RoomClient from "./room";
import { Metadata } from "next";

// 1. Cập nhật kiểu dữ liệu: params là Promise
type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 2. Await params trước khi dùng
  const { code } = await params;
  
  const supabase = await createClient(); // Lưu ý await createClient() nếu dùng bản mới nhất
  const { data: event } = await supabase
    .from("events")
    .select("title")
    .eq("code", code)
    .single();

  return {
    title: event ? `${event.title} - Puzzlee` : "Tham gia sự kiện",
  };
}

export default async function EventPage({ params }: Props) {
  // 3. Await params để lấy code thực
  const { code } = await params;

  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("code", code)
    .single();

  if (!event) {
    return notFound();
  }

  // Truyền dữ liệu xuống Client Component
  return <RoomClient event={event} />;
}
