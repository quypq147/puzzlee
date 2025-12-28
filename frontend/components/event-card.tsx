"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Copy, Calendar } from "lucide-react"
import Link from "next/link"
import { Event } from "@/types/custom" // Import type chuẩn
import { format } from "date-fns"
import { toast } from "sonner"

interface EventCardProps {
  event: Event // Sử dụng type Event chuẩn đã định nghĩa
}

export function EventCard({ event }: EventCardProps) {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(event.code)
    toast.success("Đã sao chép mã sự kiện")
  }

  return (
    <Card className="hover:shadow-md transition-shadow group relative overflow-hidden border-l-4 border-l-transparent hover:border-l-[#39E079]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <CardTitle className="line-clamp-1 text-lg font-bold group-hover:text-[#39E079] transition-colors">
              {event.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2 h-10">
              {event.description || "Chưa có mô tả"}
            </p>
          </div>
          <Badge variant={event.isActive ? "default" : "secondary"} className={event.isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
            {event.isActive ? "Active" : "Closed"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(event.startDate), "dd/MM/yyyy")}</span>
            </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 p-2 border border-dashed">
          <div className="text-center flex-1">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Event Code</p>
            <p className="font-mono font-bold text-lg tracking-widest text-primary">{event.code}</p>
          </div>
          <Button size="icon" variant="ghost" onClick={handleCopyCode} className="h-8 w-8 text-gray-400 hover:text-primary">
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        {/* [QUAN TRỌNG] Link trỏ tới [code] thay vì [id] */}
        <Link href={`/dashboard/events/${event.code}/questions`} className="block">
          <Button className="w-full bg-white border-2 border-gray-100 hover:border-[#39E079] hover:bg-green-50 text-gray-700 font-semibold transition-all">
            Vào quản lý
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}