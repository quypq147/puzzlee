"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateQuestion } from "@/lib/api/questions"
import { toast } from "sonner"

interface EditQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: { id: string, content: string }
  onSuccess?: (newContent: string) => void
}

export function EditQuestionDialog({ open, onOpenChange, question, onSuccess }: EditQuestionDialogProps) {
  const [content, setContent] = useState(question.content)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      await updateQuestion(question.id, { content })
      toast.success("Đã cập nhật câu hỏi")
      onSuccess?.(content)
      onOpenChange(false)
    } catch (error) {
      toast.error("Lỗi khi cập nhật")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa câu hỏi</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}