"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {questionApi} from "@/lib/api/questions"// API mới

export default function JoinPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setLoading(true);
    try {
      // Gọi API tham gia (Check code + Add member)
      const res = await questionApi.join(code.toUpperCase());
      toast({ title: "Thành công", description: "Đang vào phòng..." });
      
      // Chuyển hướng tới trang Room
      // Lưu ý: Route của bạn là /dashboard/events/[code] (cho Host) 
      // hoặc /(event)/[code] (cho Member). Hãy chắc chắn redirect đúng.
      // Ở đây tôi giả định Member view:
      router.push(`/${code.toUpperCase()}`); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Mã sự kiện không hợp lệ",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Tham gia sự kiện</CardTitle>
          <CardDescription>Nhập mã code được cung cấp bởi Host</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <Input
              placeholder="Ví dụ: AB12CD"
              className="text-center text-lg uppercase tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang kiểm tra..." : "Vào phòng ngay"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}