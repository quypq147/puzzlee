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
import {apiClient} from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

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
      // Gọi API Backend: POST /events/join
      const res = await apiClient.post("/events/join", { 
        code: code.trim().toUpperCase() // Code thường viết hoa
      });
      
      const event = res.data.event; // Giả sử backend trả về { message, event }

      toast({ title: "Đã tham gia", description: `Chào mừng bạn đến với ${event.title}` })
      setOpen(false)
      
      // Điều hướng đến trang sự kiện
      // Chú ý: Route frontend của bạn có thể là /dashboard/events/[code] hoặc /event/[code]
      router.push(`/dashboard/events/${event.code}`) 

    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Lỗi", 
        description: error.response?.data?.message || "Mã sự kiện không hợp lệ" 
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
              placeholder="VD: X8K9L"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="text-center text-lg tracking-widest uppercase font-mono"
              maxLength={10}
            />
          </div>

          <div className="flex justify-end gap-2">
             <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Đóng</Button>
            <Button onClick={handleJoin} disabled={loading || !code} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tham gia
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}