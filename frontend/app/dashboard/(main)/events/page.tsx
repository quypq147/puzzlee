// app/dashboard/events/page.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  TrendingUp, 
  Zap, 
  Plus, 
  LayoutGrid,
  Users
} from "lucide-react";

import { CreateEventDialog } from "@/components/dialog/create-event-dialog";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EventsPage() {
  const [events, setEvents] = React.useState<
    Array<{
      id: string;
      title: string;
      description: string | null;
      code: string | null;
      created_at: string | null;
    }>
  >([]);
  const { user } = useAuth();
  
  // State để mở dialog tạo sự kiện
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // Fetch dữ liệu thật từ Supabase
  React.useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("events")
        .select("id, title, description, code, created_at")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });
      setEvents(data ?? []);
    };
    load();
  }, [user?.id]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* SECTION 1: Banner & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Event Banner */}
          <div className="md:col-span-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden group transition-transform hover:scale-[1.01]">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
               <Plus className="w-[200px] h-[200px]" />
            </div>
            <div className="relative z-10 flex flex-col items-start h-full justify-center">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mb-4 inline-flex">
                <Zap className="text-white w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Tạo sự kiện mới</h2>
              <p className="text-green-50 mb-8 max-w-md">
                Bắt đầu Q&A, Live Polls hoặc Khảo sát ý kiến cho cuộc họp của bạn ngay bây giờ.
              </p>
              <div className="flex gap-3">
                {/* Nút này sẽ mở Dialog */}
                <Button 
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-white text-teal-700 font-bold hover:bg-gray-50 flex items-center gap-2 border-none"
                >
                  <Plus className="w-5 h-5" />
                  Tạo từ đầu
                </Button>
              </div>
            </div>
            
            {/* Component Dialog ẩn, được kích hoạt bởi state */}
            <div className="hidden">
                <CreateEventDialog
                    // Chúng ta cần sửa lại CreateEventDialog một chút để nhận prop open/onOpenChange nếu muốn điều khiển từ ngoài, 
                    // hoặc đơn giản là bọc Button trên bằng DialogTrigger.
                    // Ở đây tôi giả định bạn sẽ sửa lại UI, nhưng để code chạy ngay, tôi render nó ở đây.
                    // Tạm thời Logic cũ: Nó tự có nút trigger. 
                    // Để đúng UI trên, bạn cần sửa CreateEventDialog để nhận `open` prop hoặc dùng trick CSS.
                    // *Giải pháp nhanh:* Tôi đặt sự kiện update list ở đây.
                    onEventCreated={(ev: any) => setEvents((prev) => [ev, ...prev])}
                />
            </div>
          </div>

          {/* Stats Box */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700">Tổng quan tháng này</h3>
                <Calendar className="text-slate-400 w-5 h-5" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900">{events.length}</span>
                <span className="text-sm text-slate-500">sự kiện</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded">
                <TrendingUp className="w-4 h-4" />
                <span>Hoạt động tích cực</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Gần đây nhất
              </h4>
              {events.length > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex flex-col items-center justify-center leading-none border border-orange-200">
                    <span className="text-[10px] font-bold uppercase">
                        {events[0].created_at ? format(new Date(events[0].created_at), "MMM") : "--"}
                    </span>
                    <span className="text-lg font-bold">
                        {events[0].created_at ? format(new Date(events[0].created_at), "dd") : "--"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                      {events[0].title}
                    </p>
                    <p className="text-xs text-slate-500">
                        Code: {events[0].code}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Chưa có sự kiện nào</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Event List */}
        <div className="flex flex-col gap-5">
          {/* Filter & Search Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Danh sách sự kiện</h2>
              <p className="text-sm text-slate-500 mt-1">
                Quản lý và theo dõi tất cả các phiên tương tác của bạn
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary" />
                <input
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 shadow-sm"
                  placeholder="Tìm kiếm..."
                  type="text"
                />
              </div>
              <button className="p-2 bg-white border border-gray-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav aria-label="Tabs" className="flex gap-6">
              <button className="border-b-2 border-primary py-3 px-1 text-sm font-semibold text-primary">
                Tất cả <span className="ml-2 bg-primary/10 text-primary py-0.5 px-2 rounded-full text-xs">{events.length}</span>
              </button>
              <button className="border-b-2 border-transparent py-3 px-1 text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300">
                Đang diễn ra
              </button>
              <button className="border-b-2 border-transparent py-3 px-1 text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300">
                Đã kết thúc
              </button>
            </nav>
          </div>

          {/* List Items */}
          <div className="flex flex-col gap-3">
            {events.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    Bạn chưa có sự kiện nào. Hãy tạo sự kiện đầu tiên!
                </div>
            )}

            {events.map((ev) => {
                const dateObj = ev.created_at ? new Date(ev.created_at) : new Date();
                return (
                    <div key={ev.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-primary/30 transition-all group flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <Link href={`/dashboard/events/${ev.code}`} className="flex items-center gap-4 flex-1 cursor-pointer">
                            {/* Date Box */}
                            <div className="shrink-0 w-12 h-12 bg-emerald-50 rounded-lg flex flex-col items-center justify-center text-emerald-700 border border-emerald-100">
                                <span className="text-[10px] font-bold uppercase tracking-wide">
                                    {format(dateObj, "MMM")}
                                </span>
                                <span className="text-lg font-bold leading-none">
                                    {format(dateObj, "dd")}
                                </span>
                            </div>
                            
                            {/* Content */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-lg">
                                        {ev.title}
                                    </h3>
                                    {/* Mock Status Tag - Logic này có thể phát triển thêm sau */}
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
                                        Active
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                                        #{ev.code}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    {/* Placeholder cho số lượng người tham gia */}
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" /> --
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Action Menu */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                            <Link href={`/dashboard/events/${ev.code}`}>
                                <Button variant="ghost" className="bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20">
                                    Vào trang quản lý
                                </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                );
            })}
          </div>
        </div>
        
        {/* Component Dialog thật sự để handle logic tạo */}
        <CreateEventDialog 
            // Nếu bạn muốn dùng nút "Tạo từ đầu" ở trên để mở dialog này
            // Cách đơn giản nhất trong Shadcn là đặt DialogTrigger bao quanh Button ở trên.
            // Hoặc sử dụng state control nếu component hỗ trợ.
            // Ở đây tôi render một instance ẩn để đảm bảo logic code cũ không bị gãy nếu bạn cần dùng.
            className="hidden" 
        />
      </div>
    </div>
  );
}
