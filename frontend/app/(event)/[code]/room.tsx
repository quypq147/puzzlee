"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useEventRealtime } from "@/hooks/use-event-realtime";
import { questionApi } from "@/lib/api/questions";
import { Question } from "@/types/custom";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/question-card";
import { useToast } from "@/components/ui/use-toast";
import { socket } from "@/lib/socket";
import {
  Menu,
  MessageSquare,
  BarChart2,
  User,
  Moon,
  Sun,
  MoreHorizontal,
  Smile,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomProps {
  eventId: string;
  eventCode: string;
}

export default function EventRoom({ eventId, eventCode }: RoomProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newContent, setNewContent] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"qa" | "poll">("qa");

  // 1. Tải dữ liệu ban đầu
  useEffect(() => {
    questionApi
      .getByEvent(eventId)
      .then((res) => setQuestions(res.data))
      .catch(console.error);
    socket.emit("join-event", { eventId });
    return () => {
      // socket.emit("leave-event", { eventId }); // Nếu backend hỗ trợ
    };
  }, [eventId]);

  // 2. Kích hoạt Socket Realtime
  useEventRealtime({
    eventId,
    onNewQuestion: (q) => {
      setQuestions((prev) => [q, ...prev]);
    },
    onUpdateVote: (updatedQ) => {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === updatedQ.id ? { ...q, score: updatedQ.score } : q
        )
      );
    },
  });

  // 3. Gửi câu hỏi mới
  const handleAsk = () => {
    if (!newContent.trim()) return;

    const socketInstance = socket;
    socketInstance.emit("create-question", {
      eventId,
      userId: user?.id,
      content: newContent,
      isAnonymous: false,
    });

    setNewContent("");
    toast({ title: "Đã gửi câu hỏi!" });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen overflow-hidden bg-[#f9fafb] dark:bg-[#111827] text-gray-800 dark:text-gray-200 font-sans transition-colors duration-200",
        isDarkMode ? "dark" : ""
      )}
    >
      {/* HEADER */}
      <header className="bg-[#1c5b9f] text-white h-14 flex-none shadow-md z-20 relative px-4 flex items-center justify-between">
        <div className="flex items-center gap-4 w-1/4">
          <button className="p-2 hover:bg-white/10 rounded-full transition">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-lg truncate hidden sm:block">
            Sự kiện #{eventCode}
          </span>
        </div>

        <div className="flex h-full items-end justify-center w-1/2 gap-1">
          <button
            onClick={() => setActiveTab("qa")}
            className={cn(
              "relative px-4 sm:px-6 py-4 font-medium flex items-center gap-2 hover:bg-white/10 transition",
              activeTab === "qa"
                ? "text-white"
                : "text-blue-200 hover:text-white"
            )}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="hidden sm:inline">Hỏi đáp</span>
            {activeTab === "qa" && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-t"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("poll")}
            className={cn(
              "relative px-4 sm:px-6 py-4 font-medium flex items-center gap-2 hover:bg-white/10 transition",
              activeTab === "poll"
                ? "text-white"
                : "text-blue-200 hover:text-white"
            )}
          >
            <BarChart2 className="w-5 h-5 rotate-90" />
            <span className="hidden sm:inline">Bình chọn</span>
            {activeTab === "poll" && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-t"></div>
            )}
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 w-1/4">
          <button className="w-8 h-8 rounded-full bg-blue-100 text-[#1c5b9f] flex items-center justify-center font-bold text-sm hover:bg-white transition">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* BODY LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR (Desktop only) */}
        <aside className="w-72 bg-white dark:bg-[#1f2937] border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col justify-between overflow-y-auto z-10">
          <div className="p-6">
            <div className="mb-8">
              <h2 className="font-bold text-lg mb-1 dark:text-white">
                Sự kiện Demo
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                14 - 16 thg 12, 2025
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                #{eventCode}
              </p>
            </div>

            <nav className="space-y-1">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-[#1c5b9f] dark:text-blue-300 font-medium rounded-lg transition cursor-pointer">
                <MessageSquare className="w-5 h-5" />
                Tương tác trực tiếp
              </div>
            </nav>

            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

            <div
              className="flex items-center justify-between px-2 py-2 cursor-pointer"
              onClick={toggleTheme}
            >
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                {isDarkMode ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
                <span>Chế độ tối</span>
              </div>

              {/* Toggle Switch UI */}
              <div
                className={cn(
                  "w-10 h-5 bg-gray-300 rounded-full relative transition-colors duration-300",
                  isDarkMode ? "bg-[#1c5b9f]" : ""
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-0 border-2 transition-all duration-300",
                    isDarkMode
                      ? "right-0 border-[#1c5b9f]"
                      : "left-0 border-gray-300"
                  )}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-6 text-center">
            <div className="text-2xl font-bold tracking-tight text-[#1d8e3e] opacity-20 select-none">
              slido
            </div>
            <div className="text-xs text-gray-400 mt-2">© 2025 Puzzlee</div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 relative flex flex-col items-center w-full overflow-y-auto pb-20 scroll-smooth bg-[#f9fafb] dark:bg-[#111827]">
          {/* INPUT BAR */}
          <div className="w-full max-w-3xl px-4 pt-6 pb-4 z-10 sticky top-0 bg-[#f9fafb] dark:bg-[#111827]">
            <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex items-center gap-4 cursor-text transition hover:shadow-md group">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition shrink-0">
                <User className="w-5 h-5" />
              </div>

              <input
                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-base w-full"
                placeholder="Nhập câu hỏi của bạn..."
                type="text"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              />

              <button
                onClick={handleAsk}
                className="text-gray-400 hover:text-[#1d8e3e] transition"
                disabled={!newContent.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* QUESTIONS LIST or EMPTY STATE */}
          <div className="w-full max-w-3xl px-4 flex-1">
            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full py-12 md:py-20 text-center">
                <div className="relative w-32 h-32 mb-6 opacity-30 dark:opacity-20">
                  <div className="absolute inset-0 bg-gray-300 rounded-full flex items-center justify-center transform -translate-x-2">
                    <User className="w-16 h-16 text-gray-500" />
                  </div>
                  <div className="absolute inset-0 bg-gray-300 rounded-full flex items-center justify-center transform translate-x-4 scale-90 z-10 border-4 border-[#f9fafb] dark:border-[#111827]">
                    <User className="w-14 h-14 text-gray-500" />
                  </div>
                  <div className="absolute -top-2 right-0 bg-gray-400 rounded-full w-10 h-10 flex items-center justify-center border-4 border-[#f9fafb] dark:border-[#111827] z-20">
                    <span className="text-white font-bold text-lg">?</span>
                  </div>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-lg mb-1 font-medium">
                  Chưa có câu hỏi nào.
                </h3>
                <p className="text-gray-800 dark:text-gray-100 text-xl font-bold">
                  Hãy là người đầu tiên đặt câu hỏi!
                </p>
              </div>
            ) : (
              <div className="space-y-4 pb-24">
                {questions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    authorRole={q.authorRole} // [FIX] Truyền role xuống
                  />
                ))}
              </div>
            )}
          </div>

          {/* FLOATING ACTION BUTTON (Mobile/Tablet) */}
          <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-30">
            <button
              onClick={handleAsk}
              className="bg-[#1d8e3e] hover:bg-green-700 text-white rounded-full h-14 w-14 md:h-auto md:w-auto md:px-8 md:py-3 shadow-lg flex items-center justify-center gap-2 transition transform hover:scale-105 active:scale-95"
            >
              <span className="font-bold text-lg hidden md:inline">
                Gửi câu hỏi
              </span>
              <Send className="w-6 h-6 md:hidden" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
