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
import { use } from "react"; // <--- 1. Import hook use

export default function QuestionsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>; // <--- 2. Đổi thành Promise
}) {
  const { code } = use(params); // <--- 3. Unwrap params để lấy code

  const pathname = usePathname();
  // Xây dựng base URL dùng biến 'code' đã lấy được
  const baseUrl = `/dashboard/events/${code}/questions`;

  // Danh sách các tabs
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
      name: "Câu đố",
      href: `${baseUrl}/quiz`,
      icon: CheckCircle2,
      isActive: (path: string) => path.includes("/quiz"),
    },
  ];

  // Kiểm tra xem có đang ở trang tạo mới không
  const isCreatePage = pathname.endsWith("/new");

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
      {/* --- THANH TABS --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center bg-muted/50 p-1 rounded-lg">
          {tabs.map((tab) => {
            const active = tab.isActive(pathname);
            const Icon = tab.icon;

            return (
              <Link key={tab.href} href={tab.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 rounded-md transition-all",
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

        {!isCreatePage ? (
          <Link href={`${baseUrl}/`}>
            <Button
              size="sm"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              Tạo câu hỏi mới
            </Button>
          </Link>
        ) : (
          <Link href={`${baseUrl}/qa`}>
            <Button variant="outline" size="sm" className="gap-2">
              <LayoutList className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
        )}
      </div>

      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}