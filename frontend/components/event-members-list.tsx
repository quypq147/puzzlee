"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Users, MoreHorizontal, ShieldPlus, ShieldMinus, UserX, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { RoleBadge } from "@/components/ui/role-badge"

interface Member {
  id: string
  user_id: string
  role: string
  user: {
    display_name: string
    email: string
    avatar_url?: string
  }
  joined_at: string
}

interface EventMembersListProps {
  members: Member[]
  currentUserId?: string
  currentUserRole?: string
  eventId: string
  onMemberUpdated?: () => void
}

export function EventMembersList({ 
  members, 
  currentUserId, 
  currentUserRole,
  eventId,
  onMemberUpdated 
}: EventMembersListProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    setIsLoading(userId);
    try {
      const res = await fetch(`/api/events/${eventId}/members/manage`, {
        method: "PATCH",
        body: JSON.stringify({ userId, role: newRole }),
      });
      
      if (!res.ok) throw new Error();
      
      toast.success("Đã cập nhật vai trò thành công");
      onMemberUpdated?.();
    } catch (error) {
      toast.error("Không thể cập nhật vai trò");
    } finally {
      setIsLoading(null);
    }
  };

  const handleKick = async (userId: string) => {
    if (!confirm("Bạn có chắc muốn mời thành viên này ra khỏi sự kiện?")) return;
    
    setIsLoading(userId);
    try {
      const res = await fetch(`/api/events/${eventId}/members/manage`, {
        method: "DELETE",
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) throw new Error();

      toast.success("Đã xóa thành viên");
      onMemberUpdated?.();
    } catch (error) {
      toast.error("Lỗi khi xóa thành viên");
    } finally {
      setIsLoading(null);
    }
  };

  const canManage = currentUserRole === "ORGANIZER";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <CardTitle>Thành viên ({members.length})</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có thành viên nào</p>
          ) : (
            members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex-1 min-w-0 mr-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium truncate">{member.user.display_name}</p>
                    <RoleBadge role={member.role} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{member.user.email}</p>
                </div>
                
                {/* Chỉ hiện nút thao tác nếu là Organizer và không phải chính mình */}
                {canManage && member.user_id !== currentUserId ? (
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading === member.user_id}>
                        {isLoading === member.user_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role !== 'MODERATOR' && (
                        <DropdownMenuItem onClick={() => handleRoleUpdate(member.user_id, 'MODERATOR')}>
                          <ShieldPlus className="mr-2 h-4 w-4 text-blue-600" /> Thăng làm Điều phối
                        </DropdownMenuItem>
                      )}
                      {member.role === 'MODERATOR' && (
                        <DropdownMenuItem onClick={() => handleRoleUpdate(member.user_id, 'PARTICIPANT')}>
                          <ShieldMinus className="mr-2 h-4 w-4" /> Giáng xuống Thành viên
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleKick(member.user_id)}>
                        <UserX className="mr-2 h-4 w-4" /> Mời ra khỏi sự kiện
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  /* Nếu không quản lý được thì hiển thị Badge Role dạng text nếu cần */
                  <div className="hidden sm:block">
                     {/* RoleBadge đã hiển thị ở tên rồi, chỗ này có thể để trống hoặc hiển thị ngày tham gia */}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}