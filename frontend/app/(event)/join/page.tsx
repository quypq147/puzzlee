"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { eventApi } from "@/lib/api/event"; // Kiểm tra kỹ tên file là event.ts hay events.ts

export default function JoinPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ lấy chữ/số và viết hoa, loại bỏ ký tự đặc biệt
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setCode(value);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Đã bấm nút tham gia, code:", code); // Dòng này giúp debug

    // 1. Validate: Nếu thiếu ký tự thì báo lỗi thay vì im lặng
    if (code.length < 5) {
        toast({
            variant: "destructive",
            title: "Mã chưa hợp lệ",
            description: "Mã sự kiện phải có đủ 6 ký tự (Ví dụ: AB12CD).",
        });
        return;
    }
    
    setLoading(true);
    try {
      console.log("Đang gọi API join...");
      await eventApi.join(code);
      
      toast({ title: "Thành công", description: "Đang vào phòng..." });
      
      // Chuyển hướng
      router.push(`/${code}`); 
    } catch (error: any) {
      console.error("Lỗi join:", error);
      toast({
        variant: "destructive",
        title: "Lỗi tham gia",
        description: error?.response?.data?.message || "Không tìm thấy phòng hoặc lỗi kết nối.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Puzzlee Join</CardTitle>
          <CardDescription>Nhập mã PIN để tham gia</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <Input
              placeholder="CODE"
              className="text-center text-3xl uppercase tracking-widest font-bold h-14"
              value={code}
              onChange={handleInputChange}
              maxLength={5}
              disabled={loading}
              autoFocus // Tự động focus để nhập luôn
            />
            <Button 
                type="submit" 
                className="w-full h-12 text-lg cursor-pointer"
                disabled={loading} // Chỉ disable khi đang tải, cho phép bấm để hiện lỗi validate
            >
              {loading ? "Đang kiểm tra..." : "Vào phòng ngay"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}