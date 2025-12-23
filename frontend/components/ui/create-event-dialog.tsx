"use client"

import { useState } from "react"
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

  const handleCreate = async () => {
    if (!title.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      })

      const data = await res.json()
      if (res.ok) {
        onEventCreated(data)
        setTitle("")
        setDescription("")
        setOpen(false)
      }
    } catch (error) {
      console.error("Failed to create event:", error)
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
