"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"
import { LogIn, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function JoinEventDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleJoin = async () => {
    if (!code.trim()) return

    setLoading(true)
    try {
      // Gọi API Join Event
      // Endpoint này cần được xử lý ở backend: Nhận code -> Tìm Event -> Tạo EventMember -> Trả về Event
      const event = await apiClient<any>("/events/join", {
        method: "POST",
        body: JSON.stringify({ code: code.trim() }),
      })

      toast({ title: "Đã tham gia", description: `Chào mừng bạn đến với ${event.title}` })
      setOpen(false)
      // Chuyển hướng đến trang sự kiện
      router.push(`/dashboard/events/${event.code}`)
      
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Lỗi", 
        description: error.message || "Không tìm thấy sự kiện hoặc lỗi hệ thống" 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LogIn className="mr-2 h-4 w-4" />
          Tham gia bằng mã
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Tham gia sự kiện</DialogTitle>
          <DialogDescription>Nhập mã sự kiện (Code) được cung cấp bởi Host</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="VD: EVENT-123"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="text-center text-lg tracking-widest uppercase font-mono"
            />
          </div>

          <div className="flex justify-end gap-2">
             <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Đóng</Button>
            <Button onClick={handleJoin} disabled={loading || !code} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tham gia ngay
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}