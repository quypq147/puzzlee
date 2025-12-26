"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth"; // [EDIT] Dùng useAuth
// import { createClient } from "@/lib/supabase/client"; // [REMOVE]
// import { useRouter } from "next/navigation"; // Không cần vì useAuth.logout đã handle redirect
import { ProfileDialog } from "@/components/dialog/profile-dialog";
import * as React from "react";
import { Dialog } from "@/components/ui/dialog";

function initials(name: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserNav() {
  // [EDIT] Lấy user và hàm logout từ context
  const { user, logout } = useAuth();
  const [openProfile, setOpenProfile] = React.useState(false);

  // [EDIT] Map dữ liệu từ UserProfile mới
  const displayName = user?.fullName || user?.username || "Người dùng";
  const email = user?.email;
  // const avatarUrl = user?.avatarUrl || "/placeholder-user.jpg"; 
  // (Lưu ý: Schema backend bạn gửi có avatarUrl, nếu null thì fallback)
  const avatarUrl = "/placeholder-user.jpg"; 

  const handleLogout = () => {
    logout(); // [EDIT] Gọi hàm logout của Context (xóa token localStorage)
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer" onSelect={() => setOpenProfile(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Hồ sơ</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Cài đặt</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* [EDIT] Gắn hàm handleLogout mới */}
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      
      <Dialog open={openProfile} onOpenChange={setOpenProfile}>
         {/* Lưu ý: ProfileDialog bên trong cũng cần check xem có gọi Supabase không */}
        {openProfile ? <ProfileDialog onClose={() => setOpenProfile(false)} /> : null}
      </Dialog>
    </DropdownMenu>
  );
}

export default UserNav;