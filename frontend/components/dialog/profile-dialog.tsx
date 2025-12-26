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
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Lock, Mail } from "lucide-react";
import {apiClient} from "@/lib/api-client"

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
  const { user, login } = useAuth(); // login() ở đây dùng để refresh lại state user
  const { toast } = useToast();
  
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"general" | "security">("general");

  // Form states
  const [fullName, setFullName] = React.useState(user?.fullName || "");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");

  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // PUT /users/profile
      const res = await apiClient.put("/users/profile", { fullName });
      
      toast({ title: "Thành công", description: "Cập nhật thông tin thành công" });
      
      // Cập nhật lại context (nếu hook useAuth có hỗ trợ hàm update)
      // Nếu không, bạn có thể reload page hoặc dùng login() trick để fetch lại profile
      // Ví dụ: updateLocalUser(res.data)
      
      if (onClose) onClose();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể cập nhật hồ sơ" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    setLoading(true);
    try {
      // PUT /users/password
      await apiClient.put("/users/password", { 
        currentPassword, 
        newPassword 
      });
      
      toast({ title: "Thành công", description: "Đổi mật khẩu thành công" });
      setCurrentPassword("");
      setNewPassword("");
      if (onClose) onClose();
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Lỗi", 
        description: error.response?.data?.message || "Mật khẩu cũ không đúng" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Cài đặt tài khoản</DialogTitle>
      </DialogHeader>
      
      <div className="flex flex-col gap-6 py-4">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button 
            variant={activeTab === "general" ? "secondary" : "ghost"} 
            className="flex-1 h-8 text-sm"
            onClick={() => setActiveTab("general")}
          >
            Thông tin chung
          </Button>
          <Button 
            variant={activeTab === "security" ? "secondary" : "ghost"} 
            className="flex-1 h-8 text-sm"
            onClick={() => setActiveTab("security")}
          >
            Bảo mật
          </Button>
        </div>

        <div className="space-y-4">
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                 <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.avatarUrl || ""} />
                      <AvatarFallback className="text-xl">{user?.fullName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    {/* Nút đổi avatar có thể thêm sau */}
                 </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    className="pl-9" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={user?.email || ""} disabled className="pl-9 bg-muted" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu hiện tại</label>
                <div className="relative">
                   <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input 
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      className="pl-9"
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu mới</label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      className="pl-9"
                    />
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose} disabled={loading}>Đóng</Button>
        <Button onClick={activeTab === "general" ? handleUpdateProfile : handleChangePassword} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu thay đổi
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}