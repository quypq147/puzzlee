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
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ProfileDialog } from "@/components/dialog/profile-dialog";
import * as React from "react";
import { Dialog } from "@/components/ui/dialog";

function initials(nameOrEmail: string) {
  const parts = nameOrEmail.trim().split(/\s+/);
  const letters = parts.length > 1 ? parts.slice(0, 2) : [nameOrEmail];
  return letters.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

export function UserNav() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [openProfile, setOpenProfile] = React.useState(false);

  const displayName = profile?.first_name || "Người dùng";
  const email = user?.email;
  const avatarUrl = profile?.avatar_url || "/placeholder-user.jpg";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <Dialog open={openProfile} onOpenChange={setOpenProfile}>
        {openProfile ? <ProfileDialog onClose={() => setOpenProfile(false)} /> : null}
      </Dialog>
    </DropdownMenu>
  );
}

export default UserNav;