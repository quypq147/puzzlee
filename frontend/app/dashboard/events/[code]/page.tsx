// app/(event)/[code]/page.tsx
import { redirect } from "next/navigation";

export default async function EventPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  // Tự động chuyển hướng sang trang Questions
  redirect(`/dashboard/events/${code}/questions`);
}