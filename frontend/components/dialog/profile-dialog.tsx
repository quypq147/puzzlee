"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { Camera, Loader2, User, Lock, Mail } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export function ProfileDialogTrigger({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <ProfileDialog onClose={() => setOpen(false)} />
    </Dialog>
  );
}

export function ProfileDialog({ onClose }: { onClose?: () => void }) {
  const { user, login } = useAuth(); // login dùng để refresh lại thông tin nếu cần
  const { toast } = useToast();
  
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"general" | "security">("general");

  // State cho General
  const [fullName, setFullName] = React.useState(user?.fullName || "");
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatarUrl || "");

  // State cho Security
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await apiClient("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ fullName, avatarUrl }),
      });
      
      toast({ title: "Thành công", description: "Cập nhật hồ sơ thành công" });
      // Reload lại trang hoặc gọi hàm refreshUser trong context (nếu có) để cập nhật UI
      window.location.reload(); 
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Lỗi", 
        description: error.message || "Không thể cập nhật hồ sơ" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập đủ thông tin" });
      return;
    }
    setLoading(true);
    try {
      await apiClient("/users/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      toast({ title: "Thành công", description: "Đổi mật khẩu thành công" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Lỗi", 
        description: error.message || "Đổi mật khẩu thất bại" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden">
      <div className="flex h-[450px]">
        {/* Sidebar */}
        <div className="w-1/3 border-r bg-muted/30 p-4 space-y-2">
          <div className="font-semibold px-2 mb-4 text-lg">Cài đặt</div>
          <Button 
            variant={activeTab === "general" ? "secondary" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("general")}
          >
            <User className="mr-2 h-4 w-4" /> Hồ sơ
          </Button>
          <Button 
            variant={activeTab === "security" ? "secondary" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("security")}
          >
            <Lock className="mr-2 h-4 w-4" /> Bảo mật
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <DialogHeader className="mb-6">
            <DialogTitle>{activeTab === "general" ? "Hồ sơ cá nhân" : "Bảo mật & Mật khẩu"}</DialogTitle>
          </DialogHeader>

          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-2xl">{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Input 
                    placeholder="URL Avatar..." 
                    value={avatarUrl} 
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="h-8 text-xs w-48"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Họ và tên</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input value={user?.username || ""} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input value={user?.email || ""} disabled className="pl-9 bg-muted" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu hiện tại</label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu mới</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="p-4 border-t bg-background">
        <Button variant="outline" onClick={onClose} disabled={loading}>Đóng</Button>
        <Button onClick={activeTab === "general" ? handleUpdateProfile : handleChangePassword} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu thay đổi
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}