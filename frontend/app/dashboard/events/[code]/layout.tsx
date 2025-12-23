import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { 
  ArrowLeft, Calendar, QrCode, Share2, Play 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventSidebar } from "@/components/event-sidebar"; // Import component vừa tạo

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  // Lấy thông tin Event để hiển thị trên Header
  const { data: event } = await supabase
    .from("events")
    .select("title, code, start_time")
    .eq("code", code)
    .single();

  if (!event) return notFound();

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#f8f9fb] dark:bg-[#122017]">
      {/* --- SHARED HEADER --- */}
      <header className="bg-white dark:bg-[#1a2230] border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/events" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                {event.title}
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                #{event.code}
              </span>
            </div>
            {event.start_time && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                 <Calendar className="w-3.5 h-3.5" />
                 {format(new Date(event.start_time), "HH:mm dd/MM/yyyy")}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-gray-100 dark:bg-gray-800 border-none text-gray-600">
            <QrCode className="w-4 h-4" /> <span className="hidden lg:inline">Mã QR</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-gray-100 dark:bg-gray-800 border-none text-gray-600">
            <Share2 className="w-4 h-4" /> <span className="hidden lg:inline">Chia sẻ</span>
          </Button>
          <Link href={`/${event.code}`} target="_blank">
             <Button size="sm" className="gap-2 bg-[#39E079] hover:bg-[#2dc465] text-white font-bold shadow-md shadow-green-600/20">
               <Play className="w-4 h-4" /> Trình chiếu
             </Button>
          </Link>
        </div>
      </header>

      {/* --- BODY --- */}
      <div className="flex-1 overflow-hidden flex flex-row">
        {/* Sidebar dùng chung */}
        <EventSidebar code={code} />
        
        {/* Nội dung thay đổi theo từng trang */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}