"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  MessageSquare,
  BarChart3,
  User,
  Menu,
  Moon,
  Sun,
  Send,
  HelpCircle,
  ThumbsUp,
  Clock,
  MessageCircle,
  Bell,
  CornerDownRight,
  Users,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { QuestionCard } from "@/components/question-card"; // Đảm bảo bạn đã có component này
import { Turnstile } from "@marsidev/react-turnstile";

// --- TYPES ---
type Event = {
  id: string;
  code: string;
  title: string;
  created_at: string;
  created_by?: string;
};

type Answer = {
  id: string;
  content: string;
  created_at: string;
  author_id: string; // Quan trọng để check owner
  profiles?: { full_name: string; avatar_url?: string };
};

type Question = {
  id: string;
  content: string;
  score: number;
  created_at: string;
  is_answered: boolean;
  is_anonymous: boolean;
  status: "VISIBLE" | "HIDDEN";
  author_id: string;
  type?: "qa" | "poll" | "quiz";
  question_options?: any[];
  profiles?: { full_name: string; avatar_url?: string };
  answers?: Answer[];
};

type UserRole = "HOST" | "CO_HOST" | "PARTICIPANT" | null;

export default function RoomClient({ event }: { event: Event }) {
  const { theme, setTheme } = useTheme();
  const { user, profile } = useAuth();
  const supabase = createClient();

  // --- STATE ---
  const [activeTab, setActiveTab] = React.useState<"qa" | "polls">("qa");
  const [questionContent, setQuestionContent] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [questions, setQuestions] = React.useState<Question[]>([]);

  // Notification & Reply
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [replyContent, setReplyContent] = React.useState("");

  // Role & Join Logic
  const [role, setRole] = React.useState<UserRole>(null);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = React.useState(false);
  const [guestFirstName, setGuestFirstName] = React.useState("");
  const [guestSecondName, setGuestSecondName] = React.useState("");
  const [isJoining, setIsJoining] = React.useState(false);
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);

  // --- 1. CHECK ROLE & MEMBERSHIP ---
  React.useEffect(() => {
    const checkMembership = async () => {
      if (!user) {
        // KHÔNG ép mở dialog, cho phép xem trước
        return;
      }

      // Đã đăng nhập -> Check xem đã có trong bảng event_members chưa
      const { data: memberData } = await supabase
        .from("event_members")
        .select("role")
        .eq("event_id", event.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberData) {
        setRole(memberData.role);
      } else {
        await joinEvent(user.id, "PARTICIPANT");
      }
    };

    checkMembership();
  }, [user, event.id, supabase]);

  // Hàm xử lý Join Event (Ghi vào DB)
  const joinEvent = async (userId: string, role: string) => {
    const { error } = await supabase.from("event_members").insert({
      event_id: event.id,
      user_id: userId,
      role: role,
    });
    if (!error) {
      setRole(role as UserRole);
      // toast.success("Đã tham gia sự kiện!"); // Có thể bỏ toast này cho đỡ phiền
    }
  };

  // Hàm xử lý khi khách bấm nút "Cập nhật tên / Vào phòng"
  const handleGuestJoin = async () => {
    if (!guestFirstName.trim() && !guestSecondName.trim()) return;
    // Nếu chưa đăng nhập thì cần Captcha
    if (!user && !captchaToken) {
      toast.error("Vui lòng xác thực bạn không phải là robot.");
      return;
    }
    setIsJoining(true);

    try {
      let currentUserId = user?.id;

      // 1. Nếu chưa có User -> Đăng nhập ẩn danh
      if (!currentUserId) {
        const { data: authData, error: authError } =
          await supabase.auth.signInAnonymously({
            options: { captchaToken: captchaToken || undefined },
          });
        if (authError) throw authError;
        currentUserId = authData.user?.id;
      }

      if (!currentUserId) throw new Error("Không xác định được người dùng.");

      // 2. Cập nhật tên hiển thị (cho dù là user mới hay cũ muốn đổi tên)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ first_name: guestFirstName, last_name: guestSecondName }) // Chỉ update tên, giữ nguyên username cũ nếu có
        .eq("id", currentUserId);

      // Nếu update fail (do chưa có row), dùng upsert hoặc insert (tùy trigger DB)
      // Nhưng ở step trước ta đã có trigger handle_new_user lo việc insert rồi.

      // 3. Join event nếu chưa join
      if (!role) {
        await joinEvent(currentUserId, "PARTICIPANT");
      }

      toast.success("Đã cập nhật thông tin!");
      setIsJoinDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Lỗi khi cập nhật");
      setCaptchaToken(null);
    } finally {
      setIsJoining(false);
    }
  };

  // --- 2. FETCH DATA & REALTIME ---
  React.useEffect(() => {
    const fetchQuestions = async () => {
      let query = supabase
        .from("questions")
        .select(
          `
          *, 
          profiles:author_id(full_name, avatar_url),
          answers(
            id, content, created_at, author_id,
            profiles:author_id(full_name, avatar_url)
          )
        `
        )
        .eq("event_id", event.id)
        .order("score", { ascending: false })
        .order("created_at", { ascending: false });

      // Nếu không phải Host/Co-host, chỉ hiện câu hỏi VISIBLE
      // Tuy nhiên ở Client, logic này hơi trễ vì role load async.
      // Tốt nhất RLS nên chặn, ở đây ta filter thêm cho chắc.
      // if (role !== 'HOST' && role !== 'CO_HOST') {
      //    query = query.eq("status", "VISIBLE");
      // }
      // Tạm thời load hết, filter lúc render hoặc sau

      const { data } = await query;
      if (data) setQuestions(data as any);
    };

    fetchQuestions();

    const qChannel = supabase
      .channel(`event_questions:${event.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "questions",
          filter: `event_id=eq.${event.id}`,
        },
        () => fetchQuestions()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "answers" },
        () => fetchQuestions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(qChannel);
    };
  }, [event.id, supabase, role]); // Thêm role vào dependency nếu muốn reload khi role đổi

  // ... (Giữ nguyên logic Notification useEffect) ...

  // --- ACTIONS ---
  const handleSubmitQuestion = async () => {
    if (!questionContent.trim()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("questions").insert({
        content: questionContent,
        event_id: event.id,
        author_id: user?.id || null,
        is_anonymous: !user,
        status: "VISIBLE",
        score: 0,
      });
      if (error) throw error;
      toast.success("Đã gửi câu hỏi!");
      setQuestionContent("");
    } catch (error) {
      toast.error("Không thể gửi câu hỏi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (questionId: string) => {
    // [THAY ĐỔI] Bỏ đoạn kiểm tra user để cho phép reply ẩn danh hoàn toàn
    /* if (!user) {
        setIsJoinDialogOpen(true);
        return;
    }
    */

    if (!replyContent.trim()) return;

    try {
      const { error } = await supabase.from("answers").insert({
        question_id: questionId,
        content: replyContent,
        // Nếu có user thì lấy ID, không thì gửi null
        author_id: user?.id || null,
      });

      if (error) throw error;

      toast.success("Đã trả lời!");
      setReplyContent("");
      setReplyingTo(null);
    } catch (error: any) {
      console.error(error);
      toast.error("Lỗi khi gửi trả lời: " + error.message);
    }
  };

  // Quyền quản trị
  const canModerate = role === "HOST" || role === "CO_HOST";

  // Hàm xóa câu hỏi (cho Admin)
  const handleDeleteQuestion = async (id: string) => {
    if (!canModerate) return;
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) toast.error("Không xóa được");
    else toast.success("Đã xóa câu hỏi");
  };

  return (
    <div className="flex flex-col h-screen bg-[#f9fafb] dark:bg-[#111827] text-gray-800 dark:text-gray-200 font-sans transition-colors duration-200">
      {/* DIALOG JOIN CHO KHÁCH */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => {
            // Cho phép click ra ngoài để đóng dialog (không bắt buộc nữa)
            // e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {user ? "Cập nhật hồ sơ" : "Tham gia thảo luận"}
            </DialogTitle>
            <DialogDescription>
              {user
                ? "Đổi tên hiển thị của bạn trong sự kiện này."
                : "Nhập tên để mọi người biết bạn là ai khi đặt câu hỏi."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên hiển thị</label>
              <Input
                placeholder="Ví dụ: Minh"
                value={guestFirstName}
                onChange={(e) => setGuestFirstName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGuestJoin()}
              />
              <Input
                placeholder="Ví dụ: An"
                value={guestSecondName}
                onChange={(e) => setGuestSecondName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGuestJoin()}
              />
            </div>

            {/* Chỉ hiện Captcha nếu chưa đăng nhập */}
            {!user && (
              <div className="flex justify-center py-2">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onError={() => setCaptchaToken(null)}
                  onExpire={() => setCaptchaToken(null)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleGuestJoin}
              disabled={
                isJoining ||
                (!guestFirstName.trim() && !guestSecondName.trim()) ||
                (!user && !captchaToken)
              }
            >
              {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user ? "Lưu thay đổi" : "Vào phòng ngay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* HEADER */}
      <header className="h-14 bg-[#1c5b9f] text-white flex-none shadow-md z-20 relative">
        <div className="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">
          {/* Left */}
          <div className="flex items-center gap-4 w-1/4">
            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden p-1 hover:bg-white/10 rounded-full transition">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SidebarContent event={event} />
              </SheetContent>
            </Sheet>
            <span className="font-semibold text-lg truncate hidden md:block">
              {event.title}
            </span>
            {canModerate && (
              <Badge
                variant="secondary"
                className="ml-2 bg-yellow-400 text-yellow-900"
              >
                Host
              </Badge>
            )}
          </div>

          {/* Center: Tabs */}
          <div className="flex h-full items-end justify-center w-1/2">
            <button
              onClick={() => setActiveTab("qa")}
              className={`relative px-4 py-4 font-medium flex items-center gap-2 transition ${
                activeTab === "qa"
                  ? "text-white"
                  : "text-blue-200 hover:text-white"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="hidden sm:inline">Hỏi đáp</span>
              {activeTab === "qa" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-t" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("polls")}
              className={`relative px-4 py-4 font-medium flex items-center gap-2 transition ${
                activeTab === "polls"
                  ? "text-white"
                  : "text-blue-200 hover:text-white"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden sm:inline">Bình chọn</span>
              {activeTab === "polls" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-t" />
              )}
            </button>
          </div>

          {/* Right: User Profile & Join Trigger */}
          <div className="flex items-center justify-end gap-3 w-1/4">
            {/* Nếu đã có tên thì hiện tên, chưa có thì ẩn hoặc hiện "Khách" */}
            {profile?.first_name && (
              <span className="text-sm font-medium hidden sm:block text-blue-100 truncate max-w-[100px]">
                {profile.first_name} {profile.second_name}
              </span>
            )}

            {/* Click vào Avatar -> Mở Dialog Profile */}
            <div
              onClick={() => {
                // Pre-fill tên hiện tại nếu có
                if (profile?.first_name) setGuestFirstName(profile.first_name);
                if (profile?.second_name)
                  setGuestSecondName(profile.second_name);
                setIsJoinDialogOpen(true);
              }}
              className="w-8 h-8 rounded-full bg-blue-100 text-[#1c5b9f] flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-white hover:scale-105 transition shadow-sm"
              title="Cập nhật thông tin"
            >
              {user ? (
                <Avatar className="w-8 h-8 pointer-events-none">
                  {" "}
                  {/* pointer-events-none để click xuyên qua div cha */}
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback>
                    {profile?.first_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden max-w-7xl w-full">
        <aside className="w-72 bg-white dark:bg-[#1f2937] border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col justify-between overflow-y-auto">
          <SidebarContent event={event} />
        </aside>

        <main className="flex-1 relative flex flex-col items-center w-full overflow-y-auto pb-20 scroll-smooth bg-[#f9fafb] dark:bg-[#111827]">
          {activeTab === "qa" && (
            <>
              {/* Question Input */}
              <div className="w-full max-w-3xl px-4 pt-8 pb-4 z-10 sticky top-0 bg-[#f9fafb] dark:bg-[#111827]">
                <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 transition hover:shadow-md">
                  {/* Avatar Input */}
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 text-base outline-none"
                    placeholder={
                      user
                        ? "Nhập câu hỏi của bạn..."
                        : "Đăng nhập để đặt câu hỏi..."
                    }
                    type="text"
                    value={questionContent}
                    onClick={() => {
                      // Nếu click vào ô input mà chưa login -> Mở dialog
                      if (!user) setIsJoinDialogOpen(true);
                    }}
                    onChange={(e) => setQuestionContent(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSubmitQuestion()
                    }
                  />
                  <button
                    onClick={handleSubmitQuestion}
                    disabled={isSubmitting || !questionContent.trim()}
                    className={`transition ${
                      questionContent.trim()
                        ? "text-[#1c5b9f]"
                        : "text-gray-400"
                    }`}
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="w-full max-w-3xl px-4 pb-20 space-y-4">
                {questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center mt-12 opacity-80">
                    <HelpCircle className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-gray-500 font-medium">
                      Chưa có câu hỏi nào.
                    </h3>
                  </div>
                ) : (
                  questions.map((q) => (
                    // Sử dụng QuestionCard Component (đã có từ các bước trước)
                    // Hoặc render trực tiếp tại đây nếu chưa tách component
                    <div
                      key={q.id}
                      className="bg-white dark:bg-[#1f2937] p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-3 group"
                    >
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                              {q.is_anonymous
                                ? "Ẩn danh"
                                : q.profiles?.full_name || "Người dùng"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {format(new Date(q.created_at), "HH:mm")}
                            </span>

                            {/* ADMIN ACTION: Xoá câu hỏi */}
                            {canModerate && (
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="ml-auto text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition text-xs border border-red-200 px-2 py-0.5 rounded"
                              >
                                Xoá
                              </button>
                            )}
                          </div>
                          <p className="text-gray-800 dark:text-gray-100 text-lg">
                            {q.content}
                          </p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <button className="flex flex-col items-center text-gray-500 hover:text-[#1c5b9f] transition">
                            <ThumbsUp className="w-5 h-5" />
                            <span className="text-sm font-medium">
                              {q.score}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Actions Reply/Comment */}
                      <div className="flex items-center gap-4 border-t border-gray-100 dark:border-gray-700 pt-2">
                        <button
                          onClick={() =>
                            setReplyingTo(replyingTo === q.id ? null : q.id)
                          }
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1c5b9f]"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {q.answers?.length || 0} Trả lời
                        </button>
                      </div>

                      {/* Answer Section with Reply Input */}
                      {(replyingTo === q.id ||
                        (q.answers && q.answers.length > 0)) && (
                        <div className="pl-4 mt-2 border-l-2 border-gray-200 dark:border-gray-600 space-y-3">
                          {q.answers?.map((ans) => (
                            <div
                              key={ans.id}
                              className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm group/ans"
                            >
                              <div className="flex items-center gap-2 mb-1 justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-xs text-gray-600 dark:text-gray-300">
                                    {ans.profiles?.full_name || "Ẩn danh"}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {format(new Date(ans.created_at), "HH:mm")}
                                  </span>
                                </div>
                                {/* ADMIN ACTION: Xoá câu trả lời (nếu cần) */}
                              </div>
                              <p className="text-gray-700 dark:text-gray-200">
                                {ans.content}
                              </p>
                            </div>
                          ))}

                          {replyingTo === q.id && (
                            <div className="flex gap-2 items-center mt-2">
                              <CornerDownRight className="w-4 h-4 text-gray-400" />
                              <input
                                autoFocus
                                className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 ring-[#1c5b9f]"
                                placeholder="Viết câu trả lời..."
                                value={replyContent}
                                onChange={(e) =>
                                  setReplyContent(e.target.value)
                                }
                                onKeyDown={(e) =>
                                  e.key === "Enter" && handleReplySubmit(q.id)
                                }
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReplySubmit(q.id)}
                              >
                                <Send className="w-4 h-4 text-[#1c5b9f]" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === "polls" && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500">
                Chưa có cuộc bình chọn nào.
              </h3>
            </div>
          )}

          <div className="mt-auto py-8">
            <span className="text-[#1d8e3e] font-bold text-2xl tracking-tight">
              Puzzlee
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}

// Sidebar component
function SidebarContent({ event }: { event: Event }) {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1f2937] text-left">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="font-bold text-xl mb-1 dark:text-white break-words">
            {event.title}
          </h2>
          <p className="text-sm text-[#1c5b9f] font-mono mt-2 font-medium">
            #{event.code}
          </p>
        </div>
        {/* Ở đây có thể thêm List members nếu muốn */}
        <div className="flex items-center gap-2 text-gray-500 mb-4">
          <Users className="w-4 h-4" /> <span>Thành viên</span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            {theme === "dark" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
            <span>Giao diện</span>
          </div>
          <div
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${
              theme === "dark" ? "bg-[#1c5b9f]" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                theme === "dark" ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      </div>
      <div className="mt-auto p-6">
        <p className="text-xs text-gray-400">© 2025 Puzzlee</p>
      </div>
    </div>
  );
}
