"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// Icons
import {
  ArrowLeft,
  Calendar,
  Settings,
  Users,
  BarChart2,
  QrCode,
  Share2,
  Play,
  MessageSquare,
  Palette,
  Info,
  Lock,
  Globe,
  Key,
  Building2,
  HelpCircle,
  Save,
  Trash2,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Giả lập type cho Settings (Cần thêm cột vào DB sau này)
type EventSettings = {
  moderation: boolean;
  anonymous: boolean;
  upvotes: boolean;
  poll_auto_results: boolean;
  quiz_leaderboard: boolean;
  privacy: "public" | "password" | "sso";
};

export default function EventSettingsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  // 1. Unwrap params
  const { code } = use(params);
  const router = useRouter();
  const supabase = createClient();

  // 2. States
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Dữ liệu từ DB
  const [eventData, setEventData] = useState<any>(null);

  // Dữ liệu Settings (Mockup - bạn cần thêm cột JSONB 'settings' vào bảng events để lưu thật)
  const [settings, setSettings] = useState<EventSettings>({
    moderation: true,
    anonymous: true,
    upvotes: true,
    poll_auto_results: false,
    quiz_leaderboard: true,
    privacy: "public",
  });

  // 3. Fetch Data
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      // Logic cũ dùng code, nhưng ở đây params là eventId (thường là code trong dự án của bạn)
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("code", code) // Giả sử eventId trên URL chính là code
        .single();

      if (error || !data) {
        toast.error("Không tìm thấy sự kiện");
        // router.push("/dashboard/events"); // Uncomment nếu muốn redirect
        setLoading(false);
        return;
      }

      setEventData(data);
      // Nếu có cột settings trong DB: setSettings(data.settings)
      setLoading(false);
    };

    fetchEvent();
  }, [code, supabase, router]);

  // 4. Handle Updates
  const handleUpdate = async () => {
    if (!eventData) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("events")
      .update({
        title: eventData.title,
        // code: eventData.code, // Thường không nên cho sửa Code dễ dàng
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        updated_at: new Date().toISOString(),
        // settings: settings // TODO: Thêm cột settings kiểu JSONB vào DB
      })
      .eq("id", eventData.id);

    setIsSaving(false);

    if (error) {
      toast.error("Lỗi khi cập nhật sự kiện");
    } else {
      toast.success("Đã lưu thay đổi thành công!");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  if (!eventData) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-(--spacing(16)))] bg-[#f8f9fb] dark:bg-[#122017]">
      {/* BODY CONTENT: 2 Columns Layout */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* RIGHT MAIN CONTENT (Scrollable) */}
        <main className="flex-1 bg-[#f8f9fb] dark:bg-[#122017] overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
          <div className="max-w-4xl mx-auto pb-20 space-y-6">
            {/* Title Section */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Cài đặt sự kiện
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Quản lý thông tin chung và các tính năng tương tác.
                </p>
              </div>
              <div className="flex gap-3 sticky top-0 bg-[#f8f9fb] dark:bg-[#122017] z-10 py-2">
                <Button variant="outline" onClick={() => router.back()}>
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary-hover text-white"
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
                    value={eventData.title}
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
                      readOnly // Thường code không nên sửa
                      className="pl-7 bg-gray-100 dark:bg-gray-900 font-semibold cursor-not-allowed text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mã dùng để khán giả tham gia.
                  </p>
                </div>
                <div>
                  <Label className="mb-2 block">Thời gian diễn ra</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="datetime-local"
                      value={
                        eventData.start_time
                          ? new Date(eventData.start_time)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setEventData({
                          ...eventData,
                          start_time: e.target.value,
                        })
                      }
                      className="bg-white dark:bg-gray-800 text-sm"
                    />
                    {/* Có thể thêm End Time nếu cần */}
                  </div>
                </div>
              </div>
            </Card>

            {/* CARD 2: Q&A SETTINGS */}
            <Card className="border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" /> Thiết lập
                  Hỏi đáp (Q&A)
                </h3>
                {/* Master Toggle */}
                <Switch
                  checked={true}
                  className="data-[state=checked]:bg-[#39E079]"
                />
              </div>
              <div className="p-6 space-y-6">
                <ToggleItem
                  title="Kiểm duyệt câu hỏi (Moderation)"
                  desc="Câu hỏi phải được duyệt trước khi hiển thị."
                  checked={settings.moderation}
                  onCheckedChange={(c) =>
                    setSettings({ ...settings, moderation: c })
                  }
                />
                <Separator />
                <ToggleItem
                  title="Câu hỏi ẩn danh"
                  desc="Cho phép người tham gia đặt câu hỏi không cần tên."
                  checked={settings.anonymous}
                  onCheckedChange={(c) =>
                    setSettings({ ...settings, anonymous: c })
                  }
                />
                <Separator />
                <ToggleItem
                  title="Bình chọn câu hỏi (Upvotes)"
                  desc="Cho phép người tham gia like câu hỏi của người khác."
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
                <Separator />
                <ToggleItem
                  title="Bảng xếp hạng Quiz"
                  desc="Hiển thị top 5 người chơi xuất sắc nhất."
                  checked={settings.quiz_leaderboard}
                  onCheckedChange={(c) =>
                    setSettings({ ...settings, quiz_leaderboard: c })
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
                    label="Công khai (Có mã Code)"
                    desc="Bất kỳ ai có mã sự kiện đều có thể tham gia."
                  />
                  <RadioItem
                    active={settings.privacy === "password"}
                    onClick={() =>
                      setSettings({ ...settings, privacy: "password" })
                    }
                    icon={Key}
                    label="Bảo mật bằng mật khẩu"
                    desc="Người tham gia cần nhập mật khẩu phụ."
                  />
                  <RadioItem
                    active={settings.privacy === "sso"}
                    onClick={() => setSettings({ ...settings, privacy: "sso" })}
                    icon={Building2}
                    label="Xác thực SSO"
                    desc="Chỉ nhân viên trong tổ chức mới có thể truy cập."
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
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Đặt lại dữ liệu
                </Button>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Xóa sự kiện
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function NavButton({
  icon: Icon,
  label,
  active = false,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-left text-sm",
        active
          ? "bg-[#39E079]/10 text-[#39E079]"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-[#39E079]" : "")} />
      {label}
    </button>
  );
}

function ToggleItem({
  title,
  desc,
  checked,
  onCheckedChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onCheckedChange: (c: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between">
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
