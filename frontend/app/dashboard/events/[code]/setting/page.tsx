"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client"; // Dùng API Client
import { cn } from "@/lib/utils";

// Icons
import {
  MessageSquare,
  BarChart2,
  Info,
  Lock,
  Globe,
  Key,
  Building2,
  Trash2,
  RotateCcw,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Type định nghĩa Settings (Khớp với Prisma Json)
type EventSettings = {
  moderation: boolean;
  anonymous: boolean;
  upvotes: boolean;
  poll_auto_results: boolean;
  quiz_leaderboard: boolean;
  privacy: "public" | "password" | "sso";
};

// Default Settings
const DEFAULT_SETTINGS: EventSettings = {
  moderation: false,
  anonymous: true,
  upvotes: true,
  poll_auto_results: true,
  quiz_leaderboard: true,
  privacy: "public",
};

export default function EventSettingsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Dữ liệu Event
  const [eventData, setEventData] = useState<any>(null);
  const [settings, setSettings] = useState<EventSettings>(DEFAULT_SETTINGS);

  // 1. Fetch Data từ Backend
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        // Gọi API lấy chi tiết sự kiện
        const { data } = await apiClient.get(`/events/${code}/details`);
        
        setEventData(data);
        
        // Parse settings từ JSON DB (nếu có)
        if (data.settings) {
            // Merge với default để tránh lỗi thiếu key
            setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        }
      } catch (error) {
        toast.error("Không tìm thấy sự kiện hoặc không có quyền truy cập");
        // router.push("/dashboard/events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [code, router]);

  // 2. Handle Update
  const handleUpdate = async () => {
    if (!eventData) return;
    setIsSaving(true);

    try {
      // Gọi API PATCH để lưu title, date và settings
      await apiClient.patch(`/events/${eventData.id}`, {
        title: eventData.title,
        description: eventData.description,
        startDate: eventData.startDate, // Lưu ý: Backend trả về startDate, Prisma map camelCase
        endDate: eventData.endDate,
        settings: settings, // Gửi cả cục object settings lên
      });

      toast.success("Đã lưu thay đổi thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật sự kiện");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Handle Delete
  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa sự kiện này? Hành động không thể hoàn tác.")) return;

    try {
        await apiClient.delete(`/events/${eventData.id}`);
        toast.success("Đã xóa sự kiện");
        router.push("/dashboard/events");
    } catch (error) {
        toast.error("Lỗi xóa sự kiện");
    }
  };

  if (loading)
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
    
  if (!eventData) return null;

  return (
    <div className="flex flex-col bg-[#f8f9fb] dark:bg-[#122017] min-h-full">
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
        <div className="max-w-4xl mx-auto pb-20 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Cài đặt sự kiện
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Quản lý thông tin chung và các tính năng tương tác.
                </p>
              </div>
              <div className="flex gap-3 sticky top-4 z-10">
                <Button variant="outline" onClick={() => router.back()}>
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>

            {/* CARD 1: GENERAL INFO */}
            <Card className="border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" /> Thông tin chung
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <Label htmlFor="title" className="mb-2 block">
                    Tên sự kiện
                  </Label>
                  <Input
                    id="title"
                    value={eventData.title || ""}
                    onChange={(e) =>
                      setEventData({ ...eventData, title: e.target.value })
                    }
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <Label htmlFor="code" className="mb-2 block">
                    Mã sự kiện (Code)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      #
                    </span>
                    <Input
                      id="code"
                      value={eventData.code}
                      readOnly
                      className="pl-7 bg-gray-100 dark:bg-gray-900 font-semibold cursor-not-allowed text-gray-500"
                    />
                  </div>
                </div>
                
                {/* Start Date */}
                <div>
                  <Label className="mb-2 block">Bắt đầu</Label>
                  <Input
                    type="datetime-local"
                    value={
                      eventData.startDate
                        ? new Date(eventData.startDate).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        startDate: e.target.value,
                      })
                    }
                    className="bg-white dark:bg-gray-800 text-sm"
                  />
                </div>

                {/* End Date */}
                <div>
                  <Label className="mb-2 block">Kết thúc (Tuỳ chọn)</Label>
                  <Input
                    type="datetime-local"
                    value={
                      eventData.endDate
                        ? new Date(eventData.endDate).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        endDate: e.target.value,
                      })
                    }
                    className="bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
              </div>
            </Card>

            {/* CARD 2: Q&A SETTINGS */}
            <Card className="border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" /> Thiết lập Hỏi đáp
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <ToggleItem
                  title="Kiểm duyệt câu hỏi (Moderation)"
                  desc="Câu hỏi phải được duyệt bởi Host trước khi hiển thị cho mọi người."
                  checked={settings.moderation}
                  onCheckedChange={(c) =>
                    setSettings({ ...settings, moderation: c })
                  }
                />
                <Separator />
                <ToggleItem
                  title="Câu hỏi ẩn danh"
                  desc="Cho phép người tham gia đặt câu hỏi mà không cần lộ danh tính."
                  checked={settings.anonymous}
                  onCheckedChange={(c) =>
                    setSettings({ ...settings, anonymous: c })
                  }
                />
                <Separator />
                <ToggleItem
                  title="Bình chọn câu hỏi (Upvotes)"
                  desc="Người tham gia có thể bình chọn cho câu hỏi hay."
                  checked={settings.upvotes}
                  onCheckedChange={(c) =>
                    setSettings({ ...settings, upvotes: c })
                  }
                />
              </div>
            </Card>

            {/* CARD 3: POLLS & QUIZ */}
            <Card className="border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-purple-500" /> Polls & Quiz
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <ToggleItem
                  title="Hiển thị kết quả tự động"
                  desc="Kết quả hiện ra ngay sau khi người dùng bình chọn."
                  checked={settings.poll_auto_results}
                  onCheckedChange={(c) =>
                    setSettings({ ...settings, poll_auto_results: c })
                  }
                />
              </div>
            </Card>

            {/* CARD 4: PRIVACY */}
            <Card className="border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-500" /> Quyền riêng tư
                </h3>
              </div>
              <div className="p-6">
                <Label className="mb-3 block text-base">Quyền truy cập</Label>
                <div className="space-y-3">
                  <RadioItem
                    active={settings.privacy === "public"}
                    onClick={() =>
                      setSettings({ ...settings, privacy: "public" })
                    }
                    icon={Globe}
                    label="Công khai"
                    desc="Bất kỳ ai có mã sự kiện đều có thể tham gia."
                  />
                  <RadioItem
                    active={settings.privacy === "password"}
                    onClick={() =>
                      setSettings({ ...settings, privacy: "password" })
                    }
                    icon={Key}
                    label="Bảo mật bằng mật khẩu"
                    desc="Người tham gia cần nhập mật khẩu phụ (Tính năng đang phát triển)."
                  />
                  <RadioItem
                    active={settings.privacy === "sso"}
                    onClick={() => setSettings({ ...settings, privacy: "sso" })}
                    icon={Building2}
                    label="Nội bộ tổ chức"
                    desc="Chỉ thành viên trong Organization mới được tham gia."
                  />
                </div>
              </div>
            </Card>

            {/* DANGER ZONE */}
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30 p-6">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
                Vùng nguy hiểm
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Xóa sự kiện sẽ xóa toàn bộ câu hỏi và kết quả bình chọn.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => toast.info("Tính năng reset đang phát triển")}
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Đặt lại dữ liệu
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" /> Xóa sự kiện
                </Button>
              </div>
            </div>
        </div>
      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

function ToggleItem({ title, desc, checked, onCheckedChange }: any) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-[#39E079]"
      />
    </div>
  );
}

function RadioItem({ active, onClick, icon: Icon, label, desc }: any) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer relative transition-all",
        active
          ? "border-[#39E079] bg-[#39E079]/5"
          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
      )}
    >
      <div
        className={cn(
          "w-4 h-4 rounded-full border flex items-center justify-center",
          active ? "border-[#39E079]" : "border-gray-300"
        )}
      >
        {active && <div className="w-2 h-2 rounded-full bg-[#39E079]" />}
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold text-gray-900 dark:text-white">
          {label}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{desc}</div>
      </div>
      <Icon
        className={cn(
          "w-5 h-5 absolute right-3",
          active ? "text-[#39E079]" : "text-gray-400"
        )}
      />
    </div>
  );
}