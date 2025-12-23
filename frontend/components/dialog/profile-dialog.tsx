"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2 } from "lucide-react";

export type ProfileDialogSection = "general" | "email" | "sessions";

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
  const [section, setSection] = React.useState<ProfileDialogSection>("general");

  // Form state (you can prefill from user profile)
  const { user } = useAuth();
  const toaster = useToast();
  const supabase = createClient();
  const [firstName, setFirstName] = React.useState("");
  const [secondName, setSecondName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [currentEmail, setCurrentEmail] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [language, setLanguage] = React.useState("en");
  const [isLoading, setIsLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [usernameError, setUsernameError] = React.useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);

  React.useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, second_name, avatar_url, username")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        const d: any = data;
        setFirstName(d.first_name ?? "");
        setSecondName(d.second_name ?? "");
        setAvatarUrl(d.avatar_url ?? "");
        setUsername(d.username ?? "");
      }
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email) {
        setCurrentEmail(userData.user.email);
      }
      setIsLoading(false);
    };
    loadProfile();
  }, [user?.id]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    const path = `avatars/${user.id}/${Date.now()}-${file.name}`;
    setIsUploadingAvatar(true);
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = await supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;
      setAvatarUrl(publicUrl);
      toaster.success({ title: "Ảnh đại diện đã được cập nhật" });
    } catch (err: any) {
      toaster.error({ title: "Tải ảnh thất bại", description: err.message });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (!username.trim()) {
      setUsernameError("Tên người dùng là bắt buộc");
      toaster.error({ title: "Vui lòng nhập Tên người dùng" });
      return;
    }
    setIsLoading(true);
    try {
      // Server-side uniqueness check for username
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .limit(1);
      if (existing && existing.length > 0) {
        setUsernameError("Tên người dùng đã tồn tại");
        toaster.error({ title: "Tên người dùng đã tồn tại", description: "Vui lòng chọn tên khác." });
        setIsLoading(false);
        return;
      }
      const { error } = await (supabase as any)
        .from("profiles")
        .update({
          first_name: firstName || null,
          second_name: secondName || null,
          username: username,
          avatar_url: avatarUrl || null,
        })
        .eq("id", user.id);
      if (error) {
        // Friendly message for unique constraint violations
        const msg = (error.message || "").toLowerCase();
        if (error.code === "23505" || msg.includes("duplicate key") || msg.includes("already exists")) {
          setUsernameError("Tên người dùng đã tồn tại");
          toaster.error({ title: "Tên người dùng đã tồn tại", description: "Vui lòng chọn tên khác." });
        } else {
          throw error;
        }
        return;
      }
      toaster.success({ title: "Lưu thành công" });
      onClose?.();
    } catch (err: any) {
      toaster.error({ title: "Lưu thất bại", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    if (!newEmail.trim()) {
      toaster.error({ title: "Vui lòng nhập email mới" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toaster.success({ title: "Email đã được cập nhật", description: "Hãy kiểm tra email để xác nhận thay đổi." });
      setNewEmail("");
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email) setCurrentEmail(userData.user.email);
    } catch (err: any) {
      toaster.error({ title: "Cập nhật email thất bại", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Hồ sơ của bạn</DialogTitle>
        <DialogDescription>Quản lý thông tin cá nhân và tùy chọn của bạn.</DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left nav */}
        <aside className="md:col-span-1">
          <div className="rounded-md border bg-slate-50">
            <NavItem active={section === "general"} onClick={() => setSection("general")}>Chung</NavItem>
            <NavItem active={section === "email"} onClick={() => setSection("email")}>Tùy chọn email</NavItem>
            <NavItem active={section === "sessions"} onClick={() => setSection("sessions")}>Phiên hoạt động</NavItem>
          </div>
        </aside>

        {/* Right content */}
        <section className="md:col-span-2">
          {section === "general" && (
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="profile-info">
                <AccordionTrigger>Thông tin cá nhân</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tên đầu</label>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tên cuối</label>
                      <Input value={secondName} onChange={(e) => setSecondName(e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Tên người dùng</label>
                      <Input value={username} onChange={(e) => { setUsername(e.target.value); setUsernameError(null); }} required />
                      {usernameError ? (<p className="text-xs text-red-600">{usernameError}</p>) : null}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="language">
                <AccordionTrigger>Ngôn ngữ</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ngôn ngữ ứng dụng</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn ngôn ngữ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="avatar">
                <AccordionTrigger>Chỉnh sửa avatar</AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback>{initials(firstName, secondName)}</AvatarFallback>
                      </Avatar>
                      <Button type="button" variant="ghost" size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" onClick={() => fileInputRef.current?.click()} disabled={isUploadingAvatar}>
                        <Camera className="h-4 w-4" />
                      </Button>
                      {isUploadingAvatar && (
                        <span className="absolute -bottom-2 left-0 inline-flex items-center gap-1 text-xs text-zinc-500">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Đang tải...
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploadingAvatar || isLoading}>
                        Chọn ảnh
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy">
                <AccordionTrigger>Tùy chọn quyền riêng tư</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-600">Chọn cookie nào có thể được ứng dụng sử dụng. (Sắp ra mắt)</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="password">
                <AccordionTrigger>Đổi mật khẩu</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-600">Bạn đang đăng nhập bằng single sign-on. Mật khẩu không thể thay đổi ở đây.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {section === "email" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email hiện tại</label>
                <Input type="email" value={currentEmail} readOnly />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email mới</label>
                <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              </div>
              <div>
                <Button onClick={handleEmailUpdate} disabled={isLoading}>Cập nhật email</Button>
              </div>
            </div>
          )}

          {section === "sessions" && (
            <div className="text-sm text-slate-600">Danh sách phiên hoạt động sẽ sớm có.</div>
          )}
        </section>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>Hủy</Button>
        <Button onClick={handleSave} disabled={isLoading}>Lưu thay đổi</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function NavItem({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "w-full text-left px-4 py-3 text-sm border-b last:border-b-0 hover:bg-slate-100 rounded-md first:rounded-b-none last:rounded-t-none " +
        (active ? "bg-slate-100 font-medium" : "bg-white")
      }
    >
      {children}
    </button>
  );
}

function initials(firstName: string, secondName: string) {
  const a = firstName?.trim().charAt(0).toUpperCase() ?? "";
  const b = secondName?.trim().charAt(0).toUpperCase() ?? "";
  const res = `${a}${b}`;
  return res || "U";
}
