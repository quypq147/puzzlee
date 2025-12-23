// app/(event)/join/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hash, ArrowRight, QrCode, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner"; // Hoặc hook use-toast của bạn
import { createClient } from "@/lib/supabase/client";

export default function JoinEventPage() {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Xử lý khi nhấn nút Tham gia
  const handleJoin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!code.trim()) {
      toast.error("Vui lòng nhập mã sự kiện");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      
      // 1. Kiểm tra xem sự kiện có tồn tại không trước khi redirect
      // Lưu ý: Cần đảm bảo bảng events có chính sách RLS cho phép 'public' đọc cột 'code'
      const { data, error } = await supabase
        .from("events")
        .select("id")
        .eq("code", code.trim())
        .single();

      if (error || !data) {
        toast.error("Không tìm thấy sự kiện với mã này.");
        setIsLoading(false);
        return;
      }

      // 2. Nếu tồn tại, chuyển hướng
      toast.success("Đang tham gia...");
      // Giả định route xem sự kiện của user là /[code] hoặc /events/[code]
      // Dựa vào file tree bạn gửi: app/(event)/[code]/page.tsx -> Route là /[code]
      router.push(`/${code.trim()}`); 

    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] dark:bg-[#121212] font-sans">
      {/* Navbar Minimal */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#1e1e1e] border-b border-gray-100 dark:border-[#333333]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#39E079] rounded-lg flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            Puzzlee
          </span>
        </Link>
        <Link href="/login">
          <Button variant="ghost" className="font-medium text-slate-600 dark:text-slate-300 hover:text-[#39E079]">
            Đăng nhập
          </Button>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center animate-in fade-in zoom-in duration-500">
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tham gia sự kiện
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Nhập mã code được chia sẻ bởi người tổ chức
            </p>
          </div>

          {/* Card nhập liệu */}
          <Card className="p-8 border-gray-200 dark:border-[#333333] shadow-lg dark:bg-[#1e1e1e]">
            <form onSubmit={handleJoin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="pl-11 pr-4 h-14 text-lg border-gray-200 dark:border-[#333333] rounded-xl focus-visible:ring-[#39E079] placeholder:text-gray-300 font-medium tracking-wide uppercase" 
                    placeholder="VÍ DỤ: 123456"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-14 bg-[#39E079] hover:bg-[#2dc868] text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all text-lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Tham gia ngay
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-100 dark:border-[#333333]"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-[#1e1e1e] px-2 text-gray-400">Hoặc</span>
                </div>
              </div>

              <Button 
                type="button"
                variant="outline" 
                className="w-full h-12 bg-gray-50 dark:bg-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#333] text-slate-700 dark:text-slate-200 font-semibold rounded-xl border-gray-200 dark:border-[#333333] transition-all"
                onClick={() => toast.info("Tính năng quét QR đang phát triển")}
              >
                <QrCode className="h-5 w-5 mr-2" />
                Quét mã QR
              </Button>
            </form>
          </Card>

          <p className="text-xs text-gray-400 px-4">
            Bằng cách tham gia, bạn đồng ý với <Link href="#" className="underline hover:text-[#39E079]">Điều khoản dịch vụ</Link> và <Link href="#" className="underline hover:text-[#39E079]">Chính sách bảo mật</Link> của Puzzlee.
          </p>
        </div>
      </main>
    </div>
  );
}
 

