"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  Zap,
  Users,
  FileText,
  HelpCircle,
  PlusCircle,
} from "lucide-react";

const navigationItems = [
  {
    label: "My slidos",
    href: "/dashboard",
    icon: FileText,
  },
  {
    label: "Team",
    href: "/dashboard/team",
    icon: Users,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Tutorials",
    href: "/dashboard/tutorials",
    icon: BookOpen,
  },
];

const integrationItems = [
  { name: "PowerPoint", icon: "🔴" },
  { name: "Google Slides", icon: "📊" },
  { name: "Microsoft Teams", icon: "👥" },
  { name: "Webex", icon: "🌐" },
  { name: "Zoom", icon: "📹" },
];

export function SlidoSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 flex-col border-r bg-sidebar py-6 px-4 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-sidebar-border pt-4">
        <div className="px-3 py-2">
          <p className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wide">
            Integrations
          </p>
        </div>
        <div className="space-y-2 mt-3">
          {integrationItems.map((item) => (
            <button
              key={item.name}
              className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-left"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <button className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors justify-center font-medium">
          <HelpCircle className="h-4 w-4" />
          <span>Help</span>
        </button>
      </div>
    </aside>
  );
}
