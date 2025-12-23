"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  const [startTime, setStartTime] = useState("") // datetime-local
  const [endTime, setEndTime] = useState("") // datetime-local
  const toast = useToast()

  const handleCreate = async () => {
    if (!title.trim()) return

    setLoading(true)
    try {
      // Validate date range if provided
      if (startTime && endTime) {
        const s = new Date(startTime);
        const e = new Date(endTime);
        if (s > e) {
          toast.error({ title: "Khoảng thời gian không hợp lệ", description: "Bắt đầu phải trước hoặc bằng kết thúc" })
          setLoading(false)
          return
        }
      }

      const payload: any = { title: title.trim(), description: description || undefined }
      if (startTime) payload.start_time = new Date(startTime).toISOString()
      if (endTime) payload.end_time = new Date(endTime).toISOString()

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok) {
        onEventCreated(data)
        setTitle("")
        setDescription("")
        setStartTime("")
        setEndTime("")
        setOpen(false)
        toast.success({ title: "Tạo sự kiện thành công" })
      } else {
        toast.error({ title: "Tạo sự kiện thất bại", description: data?.error ?? "Vui lòng thử lại" })
      }
    } catch (error) {
      toast.error({ title: "Tạo sự kiện thất bại", description: (error as Error)?.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo sự kiện mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo sự kiện mới</DialogTitle>
          <DialogDescription>Tạo một sự kiện để bắt đầu nhận câu hỏi từ người tham gia</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Thời gian bắt đầu</label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Thời gian kết thúc</label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Tên sự kiện</label>
            <Input
              placeholder="vd: Hội thảo về AI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mô tả</label>
            <Textarea
              placeholder="Mô tả chi tiết về sự kiện..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Huỷ
            </Button>
            <Button onClick={handleCreate} disabled={loading || !title.trim()}>
              {loading ? "Đang tạo..." : "Tạo sự kiện"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
