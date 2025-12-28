"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { 
  ArrowLeft, Calendar, QrCode, Share2, Play, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventSidebar } from "@/components/event-sidebar";
import { apiClient } from "@/lib/api-client"; // Dùng apiClient thay Supabase
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Định nghĩa kiểu dữ liệu Event cơ bản cho Header
type EventHeaderData = {
  id: string;
  title: string;
  code: string;
  startDate: string; // Backend trả về startDate
};

export default function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  // Unrap params bằng use()
  const { code } = use(params);
  const router = useRouter();

  const [event, setEvent] = useState<EventHeaderData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu từ Backend khi component mount
  useEffect(() => {
    const fetchEventHeader = async () => {
      try {
        // Gọi API: GET /api/events/:code/details (Endpoint đã thêm ở bước trước)
        const { data } = await apiClient.get(`/events/${code}/details`);
        setEvent(data);
      } catch (error) {
        console.error("Lỗi tải thông tin sự kiện:", error);
        toast.error("Không tìm thấy sự kiện hoặc bạn không có quyền truy cập");
        router.push("/dashboard/events"); // Quay về danh sách nếu lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchEventHeader();
  }, [code, router]);

  // Hiển thị loading trong khi chờ API
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f8f9fb] dark:bg-[#122017]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#f8f9fb] dark:bg-[#122017]">
      {/* --- SHARED HEADER --- */}
      <header className="bg-white dark:bg-[#1a2230] border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/events" 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
          
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                {event.title}
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                #{event.code}
              </span>
            </div>
            {event.startDate && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                 <Calendar className="w-3.5 h-3.5" />
                 {format(new Date(event.startDate), "HH:mm dd/MM/yyyy")}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <QrCode className="w-4 h-4" /> <span className="hidden lg:inline">Mã QR</span>
          </Button>
          
          {/* Nút trình chiếu mở tab mới */}
          <Link href={`/${event.code}`} target="_blank">
             <Button size="sm" className="gap-2 bg-[#39E079] hover:bg-[#2dc465] text-white font-bold shadow-md shadow-green-600/20 border-none">
               <Play className="w-4 h-4" /> Trình chiếu
             </Button>
          </Link>
        </div>
      </header>

      {/* --- BODY --- */}
      <div className="flex-1 overflow-hidden flex flex-row">
        {/* Sidebar dùng chung cho các trang con (Questions, Settings, ...) */}
        <EventSidebar code={code} />
        
        {/* Nội dung thay đổi theo từng trang (children) */}
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}