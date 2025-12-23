"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  FileText,
  PlusCircle,
  Settings,
  Users,
  Crown,
  Zap,
  BookOpen,
  MessageSquare,
  LogOut,
} from "lucide-react";

export function ProfileDropdown() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const firstLetter = (profile?.full_name || user.email || "?").charAt(0).toUpperCase();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
            <AvatarFallback>{firstLetter}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* User Info */}
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback>{firstLetter}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Link href="/dashboard/profile">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Organization Info */}
        <div className="px-2 py-2 text-xs">
          <p className="font-medium text-foreground">669 - Phan Ngoc's organization</p>
          <p className="text-muted-foreground">Basic</p>
        </div>

        <DropdownMenuSeparator />

        {/* Main Actions */}
        <Link href="/dashboard" onClick={() => setOpen(false)}>
          <DropdownMenuItem className="cursor-pointer gap-2">
            <FileText className="h-4 w-4" />
            <span>My slidos</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/events/new" onClick={() => setOpen(false)}>
          <DropdownMenuItem className="cursor-pointer gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Create slido</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        {/* Organization & Settings */}
        <DropdownMenuItem className="cursor-pointer gap-2">
          <Settings className="h-4 w-4" />
          <span>Organization settings and billing</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer gap-2">
          <Users className="h-4 w-4" />
          <span>Team management</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Upgrade & Info */}
        <DropdownMenuItem className="cursor-pointer gap-2">
          <Crown className="h-4 w-4" />
          <span>Upgrade</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer gap-2">
          <Zap className="h-4 w-4" />
          <span>Product news</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Help & Support */}
        <DropdownMenuItem className="cursor-pointer gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Help Center</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer gap-2">
          <BookOpen className="h-4 w-4" />
          <span>Tutorials</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Send us feedback</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <Link href="/sign-out" onClick={() => setOpen(false)}>
          <DropdownMenuItem className="cursor-pointer gap-2 text-destructive">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
