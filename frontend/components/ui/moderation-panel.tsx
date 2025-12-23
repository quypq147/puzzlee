"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Trash2, Pin, Lock, CheckCircle } from "lucide-react"
import { useState } from "react"

interface ModerationPanelProps {
  questionId: string
  isOrganizer: boolean
  isPinned: boolean
  status: string
  onActionComplete: () => void
}

export function ModerationPanel({ questionId, isOrganizer, isPinned, status, onActionComplete }: ModerationPanelProps) {
  const [loading, setLoading] = useState(false)

  if (!isOrganizer) return null

  const handleAction = async (action: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/questions/${questionId}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (res.ok) {
        onActionComplete()
      }
    } catch (error) {
      console.error("Moderation action failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleAction(isPinned ? "unpin" : "pin")} className="gap-2">
          <Pin className="h-4 w-4" />
          {isPinned ? "Bỏ ghim" : "Ghim câu hỏi"}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleAction("mark_answered")}
          className="gap-2"
          disabled={status === "answered"}
        >
          <CheckCircle className="h-4 w-4" />
          Đánh dấu đã trả lời
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleAction("close")} className="gap-2" disabled={status === "closed"}>
          <Lock className="h-4 w-4" />
          Đóng câu hỏi
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            if (confirm("Bạn có chắc chắn muốn xoá câu hỏi này?")) {
              handleAction("delete")
            }
          }}
          className="gap-2 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Xoá câu hỏi
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
