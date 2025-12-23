"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MessageSquare, Settings } from "lucide-react";
import { Button } from "./ui/button";

interface EventSidebarProps {
  code: string; // Đây là code sự kiện (VD: STRATQ3)
}

export function EventSidebar({ code }: EventSidebarProps) {
  const pathname = usePathname();

  // Hàm kiểm tra active link
  const isActive = (path: string) => pathname === path;
  const baseUrl = `/dashboard/events/${code}`;

  return (
    <aside className="w-full md:w-20 bg-white dark:bg-[#1a2230] border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-y-auto shrink-0 md:block hidden">
      <div className="px-4 pb-4 pt-6">
        <NavButton
          href={`${baseUrl}`}
          active={isActive(`${baseUrl}`) || isActive(`${baseUrl}/questions`)}
          icon={MessageSquare}
        />
      </div>

      <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-4">
        <nav className="space-y-1">
          <NavButton
            href={`${baseUrl}/setting`}
            active={isActive(`${baseUrl}/setting`)}
            icon={Settings}
          />
        </nav>
      </div>
    </aside>
  );
}

function NavButton({ href, active, icon: Icon, label }: any) {
  return (
    <Link
      href={href}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-left text-sm",
        active
          ? "bg-[#39E079]/10 text-[#39E079]"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-[#39E079]" : "")} />
    </Link>
  );
}
