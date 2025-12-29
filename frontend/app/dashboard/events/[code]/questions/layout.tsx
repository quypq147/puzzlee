"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  BarChart3,
  CheckCircle2,
  PlusCircle,
  LayoutList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { use } from "react";
// [MỚI] Import Dialog tạo tương tác
import { CreateInteractionDialog } from "@/components/dialog/create-interaction-dialog";

export default function QuestionsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const pathname = usePathname();
  const baseUrl = `/dashboard/events/${code}/questions`;

  const tabs = [
    {
      name: "Hỏi đáp (Q&A)",
      href: `${baseUrl}/qa`,
      icon: MessageCircle,
      isActive: (path: string) => path.includes("/qa"),
    },
    {
      name: "Bình chọn",
      href: `${baseUrl}/polls`,
      icon: BarChart3,
      isActive: (path: string) => path.includes("/polls"),
    },
    {
      name: "Câu đố (Quiz)", // Ví dụ thêm tab Quiz nếu cần
      href: `${baseUrl}/quiz`,
      icon: CheckCircle2,
      isActive: (path: string) => path.includes("/quiz"),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b bg-white dark:bg-gray-900 px-6 py-3 shrink-0">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const active = tab.isActive(pathname);
            const Icon = tab.icon;

            return (
              <Link key={tab.href} href={tab.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 rounded-md transition-all whitespace-nowrap",
                    active
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* [EDIT] Thay thế Link bằng CreateInteractionDialog */}
        <CreateInteractionDialog 
            eventId={code}
            // Callback này có thể dùng để refresh dữ liệu nếu cần thiết 
            // (Tuy nhiên danh sách câu hỏi thường tự refresh hoặc dùng realtime)
            onQuestionCreated={() => {
                // Có thể thêm logic reload hoặc toast thông báo tại đây
                console.log("New interaction created!");
            }}
            trigger={
                <Button
                    size="sm"
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                    <PlusCircle className="h-4 w-4" />
                    Tạo tương tác mới
                </Button>
            }
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950 relative">
        {children}
      </div>
    </div>
  );
}