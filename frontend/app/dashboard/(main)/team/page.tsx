"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Loader2, 
  Search, 
  MoreVertical, 
  ShieldCheck, 
  User, 
  Filter,
  Users,
  ShieldAlert,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Type khớp với bảng public.profiles
type Profile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  // Lưu ý: email thường nằm trong auth.users. 
  // Nếu bạn chưa sync email sang profiles, trường này có thể null hoặc cần join bảng.
  email?: string; 
  role: "ADMIN" | "MODERATE" | "USER";
  created_at: string;
};

export default function SystemMembersPage() {
  const { user: currentUser } = useAuth();
  const supabase = createClient();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. FETCH DỮ LIỆU TỪ BẢNG PROFILES ---
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      // Lưu ý: Bạn cần đảm bảo RLS Policy cho phép Admin đọc bảng profiles
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setProfiles(data as Profile[]);
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // --- 2. ACTIONS HỆ THỐNG ---
  const handleUpdateSystemRole = async (userId: string, newRole: "ADMIN" | "USER") => {
    try {
        const { error } = await supabase
            .from("profiles")
            .update({ role: newRole })
            .eq("id", userId);
        
        if (error) throw error;
        
        toast.success(`Đã cập nhật vai trò thành ${newRole}`);
        // Cập nhật state cục bộ để không cần fetch lại
        setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
    } catch (err) {
        toast.error("Lỗi cập nhật vai trò");
        console.error(err);
    }
  }

  // Lưu ý: Xóa profile không xóa tài khoản Auth. 
  // Để xóa hoàn toàn cần dùng Admin API của Supabase (backend).
  // Ở đây ta chỉ xóa thông tin profile public.
  const handleDeleteProfile = async (userId: string) => {
      if(!confirm("Hành động này sẽ xóa thông tin hồ sơ công khai của người dùng. Tiếp tục?")) return;
      
      try {
          const { error } = await supabase
              .from("profiles")
              .delete()
              .eq("id", userId);

          if (error) throw error;
          toast.success("Đã xóa hồ sơ người dùng");
          setProfiles(prev => prev.filter(p => p.id !== userId));
      } catch (err) {
          toast.error("Lỗi xóa hồ sơ");
          console.error(err);
      }
  }

  // --- 3. FILTER & STATS ---
  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: profiles.length,
    admins: profiles.filter(p => p.role === 'ADMIN').length,
    users: profiles.filter(p => p.role === 'USER' || !p.role).length,
  };

  // Helper UI Badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN": 
        return <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">Admin hệ thống</Badge>;
      case "MODERATE":
      return <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">Kiểm duyệt viên</Badge>;
      default: 
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">Người dùng</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản trị Người dùng Hệ thống</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý tất cả tài khoản, phân quyền Admin và kiểm soát truy cập hệ thống.
          </p>
        </div>
        {/* Nút export hoặc thêm user thủ công có thể đặt ở đây */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 shadow-sm border-none bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng tài khoản</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm border-none bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admin</p>
              <p className="text-3xl font-bold mt-2">{stats.admins}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-sm border-none bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Người dùng thường</p>
              <p className="text-3xl font-bold mt-2">{stats.users}</p>
            </div>
            <div className="p-3 rounded-full bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              <User className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900">
        {/* Table Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-900">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </span>
            <Input 
              placeholder="Tìm theo tên, username..." 
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-none focus-visible:ring-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4" />
              Lọc danh sách
            </Button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
          <div className="col-span-6 sm:col-span-5">Thông tin tài khoản</div>
          <div className="col-span-3 sm:col-span-3">Vai trò hệ thống</div>
          <div className="col-span-3 sm:col-span-3 hidden sm:block">Ngày tham gia</div>
          <div className="col-span-3 sm:col-span-1 text-right">Thao tác</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? (
             <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
             </div>
          ) : filteredProfiles.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
                Không tìm thấy người dùng nào.
             </div>
          ) : (
            filteredProfiles.map((profile) => (
              <div key={profile.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                
                {/* Column 1: Profile Info */}
                <div className="col-span-6 sm:col-span-5 flex items-center min-w-0">
                  <Avatar className="h-10 w-10 border bg-gray-100">
                    <AvatarImage src={profile.avatar_url} className="object-cover" />
                    <AvatarFallback className="font-semibold text-gray-600">
                        {profile.username?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {(profile.first_name || "") + " " + (profile.second_name || "") || "Chưa đặt tên"}
                    </div>
                    <div className="text-sm text-muted-foreground truncate flex items-center gap-1">
                        <span className="text-gray-400">@</span>
                        {profile.username || "ẩn danh"}
                    </div>
                  </div>
                </div>

                {/* Column 2: Role Badge */}
                <div className="col-span-3 sm:col-span-3">
                  {getRoleBadge(profile.role)}
                </div>

                {/* Column 3: Date */}
                <div className="col-span-3 hidden sm:block text-sm text-muted-foreground">
                  {profile.created_at ? format(new Date(profile.created_at), "dd/MM/yyyy", { locale: vi }) : "N/A"}
                </div>

                {/* Column 4: Actions */}
                <div className="col-span-3 sm:col-span-1 text-right">
                    {/* Không cho phép tự sửa role của chính mình để tránh mất quyền Admin */}
                    {profile.id !== currentUser?.id && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Phân quyền hệ thống</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuItem onClick={() => handleUpdateSystemRole(profile.id, "ADMIN")}>
                                    <ShieldCheck className="w-4 h-4 mr-2 text-purple-600" /> Cấp quyền Admin
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem onClick={() => handleUpdateSystemRole(profile.id, "USER")}>
                                    <User className="w-4 h-4 mr-2" /> Hạ xuống User thường
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onClick={() => handleDeleteProfile(profile.id)} 
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Xóa hồ sơ
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div className="text-sm text-muted-foreground">
            Hiển thị <span className="font-medium text-foreground">{filteredProfiles.length}</span> tài khoản
          </div>
        </div>
      </Card>
    </div>
  );
}