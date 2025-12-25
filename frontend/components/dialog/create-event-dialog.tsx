"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast" // Chú ý path import toast của bạn
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { apiClient } from "@/lib/api-client"
import { Plus } from "lucide-react"

export function CreateEventDialog({
  onEventCreated,
}: {
  onEventCreated: (event: any) => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState("") 
  const [endTime, setEndTime] = useState("") 
  const { toast } = useToast()

  const handleCreate = async () => {
    if (!title.trim()) return

    setLoading(true)
    try {
      if (startTime && endTime) {
        const s = new Date(startTime);
        const e = new Date(endTime);
        if (s > e) {
          toast({ variant: "destructive", title: "Lỗi", description: "Thời gian kết thúc phải sau thời gian bắt đầu" });
          setLoading(false);
          return;
        }
      }

      // Gọi API Backend
      const newEvent = await apiClient("/events", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          startTime: startTime ? new Date(startTime).toISOString() : null,
          endTime: endTime ? new Date(endTime).toISOString() : null,
        }),
      })

      toast({ title: "Thành công", description: "Tạo sự kiện thành công" })
      onEventCreated(newEvent)
      setOpen(false)
      
      // Reset form
      setTitle("")
      setDescription("")
      setStartTime("")
      setEndTime("")
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Lỗi", 
        description: error.message || "Không thể tạo sự kiện" 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Sự kiện mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo sự kiện mới</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Tên sự kiện</label>
            <Input
              placeholder="vd: Hội thảo AI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Mô tả</label>
            <Textarea
              placeholder="Mô tả ngắn gọn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Bắt đầu</label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Kết thúc</label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Hủy</Button>
            <Button onClick={handleCreate} disabled={loading || !title}>
              {loading ? "Đang tạo..." : "Tạo sự kiện"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}