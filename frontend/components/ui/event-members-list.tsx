"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface EventMembersListProps {
  members: Array<{
    id: string
    user_id: string
    role: string
    user: {
      display_name: string
      email: string
      avatar_url?: string
    }
    joined_at: string
  }>
}

export function EventMembersList({ members }: EventMembersListProps) {
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
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <p className="font-medium">{member.user.display_name}</p>
                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                </div>
                <Badge
                  variant={
                    member.role === "organizer" ? "default" : member.role === "moderator" ? "secondary" : "outline"
                  }
                >
                  {member.role === "organizer"
                    ? "Tổ chức viên"
                    : member.role === "moderator"
                      ? "Điều phối viên"
                      : "Người tham gia"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
