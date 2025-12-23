"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Copy } from "lucide-react"
import Link from "next/link"

interface EventCardProps {
  event: {
    id: string
    title: string
    description: string
    event_code: string
    status: string
    answer_count?: number
  }
}

export function EventCard({ event }: EventCardProps) {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(event.event_code)
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2">{event.title}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
          </div>
          <Badge variant={event.status === "active" ? "default" : "secondary"} className="ml-2">
            {event.status === "active" ? "Đang hoạt động" : "Đã kết thúc"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>Câu hỏi</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
          <div className="text-center flex-1">
            <p className="text-xs text-muted-foreground">Mã sự kiện</p>
            <p className="font-mono font-semibold text-lg tracking-widest">{event.event_code}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={handleCopyCode} className="ml-2">
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <Link href={`/dashboard/events/${event.id}`} className="block">
          <Button variant="outline" className="w-full bg-transparent">
            Xem chi tiết
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
