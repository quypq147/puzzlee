"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  FolderOpen,
  ChevronRight,
  Menu,
  Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { OrganizationProvider } from "@/contexts/organization-context";

// 1. Cấu hình Menu Sidebar
const navItems = [
  {
    href: "/dashboard/events",
    label: "Sự kiện của tôi",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/team",
    label: "Team",
    icon: Users,
  },
  {
    href: "/dashboard/analytics",
    label: "Phân tích",
    icon: BarChart3,
  }
];

// 2. Map đường dẫn sang tên hiển thị tiếng Việt
const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: "Không gian làm việc",
  events: "Sự kiện của tôi",
  team: "Team",
  analytics: "Phân tích",
  templates: "Mẫu sự kiện",
  settings: "Cài đặt",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 3. Hàm tạo Breadcrumb tự động từ URL
  const renderBreadcrumbs = () => {
    // Tách URL thành các phần: /dashboard/events/123 -> ['dashboard', 'events', '123']
    const segments = pathname.split("/").filter((item) => item !== "");

    return (
      <div className="flex items-center gap-1 text-sm text-slate-500 overflow-hidden whitespace-nowrap">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const isFirst = index === 0; // dashboard
          
          // Tạo đường dẫn href cho từng nấc (ví dụ: /dashboard/events)
          const href = `/${segments.slice(0, index + 1).join("/")}`;

          // Lấy tên hiển thị từ Map, nếu không có thì dùng chính segment (cho mã code, ID...)
          let label = BREADCRUMB_MAP[segment] || segment;

          // Nếu là mã code (segment cuối cùng và không nằm trong map), viết hoa lên cho đẹp
          if (!BREADCRUMB_MAP[segment] && index > 1) {
             label = segment.toUpperCase();
          }

          return (
            <React.Fragment key={href}>
              {/* Icon mũi tên ngăn cách (trừ phần tử đầu tiên) */}
              {!isFirst && <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
              
              {isLast ? (
                // Phần tử cuối cùng (Active): Màu đậm, không click được
                <span className={`font-medium text-slate-900 truncate max-w-[150px] ${!BREADCRUMB_MAP[segment] ? 'bg-slate-100 px-1.5 py-0.5 rounded' : ''}`}>
                  {label}
                </span>
              ) : (
                // Các phần tử cha: Màu nhạt, click để quay lại
                <Link 
                  href={href} 
                  className="hover:text-primary transition-colors hidden sm:inline-block"
                >
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderNavItems = () => {
    return (
      <nav className="flex flex-col gap-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive
                  ? "bg-[#39E079]/10 text-[#39E079]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? "text-[#39E079]" : "text-slate-400"}`}
              />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  };

  return (
    <OrganizationProvider>
    <div className="min-h-screen w-full bg-[#f3f4f6] text-slate-800 font-sans flex">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-[260px] bg-white border-r border-gray-200 flex-col h-screen sticky top-0 z-30 shrink-0">
        <div className="p-6 pb-2">
          <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-8 cursor-pointer">
            <div className="w-8 h-8 bg-[#39E079] rounded-lg flex items-center justify-center text-white font-bold text-xl">
              P
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Puzzlee
            </h1>
          </Link>
          {renderNavItems()}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f3f4f6]">
        
        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between shrink-0 h-16 sticky top-0 z-20">
          
          <div className="flex items-center gap-2 overflow-hidden">
             {/* Mobile Menu */}
             <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden mr-2 -ml-2 shrink-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[260px] p-0 bg-white">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-[#39E079] rounded-lg flex items-center justify-center text-white font-bold text-xl">P</div>
                        <div className="font-bold text-xl text-slate-900">Puzzlee</div>
                    </div>
                    {renderNavItems()}
                  </div>
                </SheetContent>
             </Sheet>

            {/* Breadcrumb Dynamic */}
            {renderBreadcrumbs()}
          </div>

          <div className="flex items-center gap-4 shrink-0">
             <UserNav />
          </div>
        </header>

        {children}
        
      </main>
    </div>
    </OrganizationProvider>
  );
}