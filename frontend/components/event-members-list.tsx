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
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { RoleBadge } from "@/components/ui/role-badge"

interface Member {
  userId: string // API trả về userId (hoặc id của profile)
  eventId: string
  role: "HOST" | "MODERATOR" | "PARTICIPANT"
  joinedAt: string
  user: {
    fullName: string | null
    username: string
    avatarUrl: string | null
    email: string
  }
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
  const { toast } = useToast()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRoleUpdate = async (targetUserId: string, newRole: string) => {
    setLoadingId(targetUserId)
    try {
      // Gọi API Update Role
      await apiClient(`/events/${eventId}/members`, {
        method: "PATCH",
        body: JSON.stringify({ userId: targetUserId, role: newRole })
      })
      toast({ title: "Thành công", description: "Đã cập nhật quyền thành viên" })
      onMemberUpdated?.()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.message || "Không thể cập nhật quyền" })
    } finally {
      setLoadingId(null)
    }
  }

  const handleKick = async (targetUserId: string) => {
    if (!confirm("Bạn có chắc muốn mời thành viên này ra khỏi sự kiện?")) return
    
    setLoadingId(targetUserId)
    try {
      // Gọi API Delete Member
      await apiClient(`/events/${eventId}/members`, {
        method: "DELETE",
        body: JSON.stringify({ userId: targetUserId }) // Truyền body để biết xóa ai
      })
      toast({ title: "Thành công", description: "Đã mời thành viên ra khỏi sự kiện" })
      onMemberUpdated?.()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.message || "Thao tác thất bại" })
    } finally {
      setLoadingId(null)
    }
  }

  // Logic kiểm tra quyền quản lý
  const canManage = (targetMember: Member) => {
    if (currentUserRole === 'HOST') return targetMember.role !== 'HOST';
    if (currentUserRole === 'MODERATOR') return targetMember.role === 'PARTICIPANT';
    return false;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4">Thành viên ({members.length})</h3>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.userId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.user.avatarUrl || ""} />
                  <AvatarFallback>{member.user.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{member.user.fullName || member.user.username}</p>
                    <RoleBadge role={member.role} />
                  </div>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
              </div>

              {/* Menu điều khiển */}
              {canManage(member) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={loadingId === member.userId}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {member.role !== 'MODERATOR' && (
                      <DropdownMenuItem onClick={() => handleRoleUpdate(member.userId, 'MODERATOR')}>
                        <ShieldPlus className="mr-2 h-4 w-4 text-blue-600" /> Thăng làm Điều phối
                      </DropdownMenuItem>
                    )}
                    {member.role === 'MODERATOR' && (
                      <DropdownMenuItem onClick={() => handleRoleUpdate(member.userId, 'PARTICIPANT')}>
                        <ShieldMinus className="mr-2 h-4 w-4" /> Giáng xuống Thành viên
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive" 
                      onClick={() => handleKick(member.userId)}
                    >
                      <UserX className="mr-2 h-4 w-4" /> Mời ra khỏi sự kiện
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}