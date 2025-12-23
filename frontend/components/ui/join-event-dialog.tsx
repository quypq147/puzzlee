"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LogIn } from "lucide-react"

export function JoinEventDialog({
  onEventJoined,
}: {
  onEventJoined: (event: any) => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  const handleJoin = async () => {
    if (!code.trim()) return

    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_code: code }),
      })

      const data = await res.json()
      if (res.ok) {
        onEventJoined(data.event)
        setCode("")
        setOpen(false)
      } else {
        setError(data.error || "Không thể tham gia sự kiện")
      }
    } catch (error) {
      setError("Lỗi khi tham gia sự kiện")
      console.error("Failed to join event:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LogIn className="mr-2 h-4 w-4" />
          Tham gia sự kiện
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Tham gia sự kiện</DialogTitle>
          <DialogDescription>Nhập mã sự kiện để tham gia</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Mã sự kiện</label>
            <Input
              placeholder="vd: ABC123"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="mt-1 font-mono text-center text-lg tracking-widest"
            />
          </div>

          {error && <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Huỷ
            </Button>
            <Button onClick={handleJoin} disabled={loading || !code.trim()}>
              {loading ? "Đang tham gia..." : "Tham gia"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
