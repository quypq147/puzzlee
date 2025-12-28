import { notFound } from "next/navigation";
import RoomClient from "./room";
import { Metadata } from "next";

type Props = {
  params: Promise<{ code: string }>;
};

// Hàm lấy dữ liệu từ Backend Express
async function getEventByCode(code: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/code/${code}`, {
      cache: "no-store", // Luôn lấy dữ liệu mới nhất
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Lỗi fetch event:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const event = await getEventByCode(code); //

  return {
    title: event ? `${event.title} - Puzzlee` : "Tham gia sự kiện",
  };
}

export default async function EventPage({ params }: Props) {
  const { code } = await params;
  const event = await getEventByCode(code); //

  if (!event) {
    return notFound();
  }

  // Truyền dữ liệu event xuống Client Component
  return <RoomClient event={event} />;
}