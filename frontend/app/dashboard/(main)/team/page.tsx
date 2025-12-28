"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth"; // Giả sử hook này lấy info user từ context/token
import { apiClient } from "@/lib/api-client"; // [QUAN TRỌNG] Dùng cái này thay Supabase
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Loader2, Search, MoreVertical, ShieldCheck, User, Filter, Users, Trash2 
} from "lucide-react";
import { toast } from "sonner";
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Type khớp với response từ Backend (Prisma Model)
type UserData = {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  email: string;
  systemRole: "ADMIN" | "USER"; // Enum trong Prisma
  createdAt: string;
};

export default function SystemMembersPage() {
  const { user: currentUser } = useAuth(); // Lấy user hiện tại để tránh tự xóa mình
  const [profiles, setProfiles] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. FETCH DỮ LIỆU TỪ BACKEND ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Gọi API: GET /api/users
      const { data } = await apiClient.get("/users", {
        params: { search: searchTerm }
      });
      setProfiles(data);
    } catch (error: any) {
      console.error("Lỗi:", error);
      // Nếu lỗi 403 nghĩa là không phải Admin
      if (error.response?.status === 403) {
        toast.error("Bạn không có quyền truy cập trang này");
      } else {
        toast.error("Không thể tải danh sách người dùng");
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounce search hoặc effect khi search thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- 2. ACTIONS HỆ THỐNG ---
  const handleUpdateSystemRole = async (userId: string, newRole: "ADMIN" | "USER") => {
    try {
        // Gọi API: PATCH /api/users/:id/role
        await apiClient.patch(`/users/${userId}/role`, { role: newRole });
        
        toast.success(`Đã cập nhật vai trò thành ${newRole}`);
        // Cập nhật state cục bộ
        setProfiles(prev => prev.map(p => p.id === userId ? { ...p, systemRole: newRole } : p));
    } catch (err) {
        toast.error("Lỗi cập nhật vai trò");
        console.error(err);
    }
  }

  const handleDeleteUser = async (userId: string) => {
      if(!confirm("Hành động này sẽ xóa vĩnh viễn tài khoản người dùng. Tiếp tục?")) return;
      
      try {
          // Gọi API: DELETE /api/users/:id
          await apiClient.delete(`/users/${userId}`);

          toast.success("Đã xóa người dùng");
          setProfiles(prev => prev.filter(p => p.id !== userId));
      } catch (err) {
          toast.error("Lỗi xóa người dùng");
          console.error(err);
      }
  }

  // --- 3. STATS ---
  const stats = {
    total: profiles.length,
    admins: profiles.filter(p => p.systemRole === 'ADMIN').length,
    users: profiles.filter(p => p.systemRole === 'USER').length,
  };

  // Helper UI Badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN": 
        return <Badge className="bg-purple-600 hover:bg-purple-700">Admin hệ thống</Badge>;
      default: 
        return <Badge variant="secondary">Người dùng</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* ... Phần Header và Stats Card giữ nguyên ... */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản trị Người dùng Hệ thống</h1>
          <p className="text-sm text-muted-foreground mt-1">
             Quản lý tất cả tài khoản và phân quyền Admin.
          </p>
        </div>
      </div>

       {/* Stats Cards (Giữ nguyên logic hiển thị stats) */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ... Copy lại phần Stats Card cũ, chỉ thay số liệu từ biến stats ... */}
         <Card className="p-6 shadow-sm"><div className="text-3xl font-bold">{stats.total}</div> Users</Card>
         <Card className="p-6 shadow-sm"><div className="text-3xl font-bold">{stats.admins}</div> Admins</Card>
         <Card className="p-6 shadow-sm"><div className="text-3xl font-bold">{stats.users}</div> Normals</Card>
      </div>

      <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900">
        <div className="p-4 border-b flex items-center gap-4">
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Tìm kiếm..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? (
             <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
          ) : profiles.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">Không tìm thấy người dùng.</div>
          ) : (
            profiles.map((profile) => (
              <div key={profile.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50">
                
                {/* Info */}
                <div className="col-span-6 sm:col-span-5 flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={profile.avatarUrl || ""} />
                    <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{profile.fullName || "Chưa đặt tên"}</div>
                    <div className="text-sm text-muted-foreground truncate">@{profile.username}</div>
                    <div className="text-xs text-gray-400 truncate">{profile.email}</div>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-3">
                  {getRoleBadge(profile.systemRole)}
                </div>

                {/* Date */}
                <div className="col-span-3 hidden sm:block text-sm text-muted-foreground">
                  {profile.createdAt ? format(new Date(profile.createdAt), "dd/MM/yyyy", { locale: vi }) : "N/A"}
                </div>

                {/* Action Menu */}
                <div className="col-span-3 sm:col-span-1 text-right">
                    {/* Ẩn nút thao tác nếu là chính mình */}
                    {profile.id !== currentUser?.id && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleUpdateSystemRole(profile.id, "ADMIN")}>
                                    <ShieldCheck className="w-4 h-4 mr-2" /> Lên Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateSystemRole(profile.id, "USER")}>
                                    <User className="w-4 h-4 mr-2" /> Xuống User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteUser(profile.id)} className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" /> Xóa User
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}