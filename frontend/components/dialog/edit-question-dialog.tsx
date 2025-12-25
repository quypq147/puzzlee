"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client" // Dùng trực tiếp hoặc qua lib wrapper

interface EditQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: { id: string, content: string }
  onSuccess?: (newContent: string) => void
}

export function EditQuestionDialog({ open, onOpenChange, question, onSuccess }: EditQuestionDialogProps) {
  const [content, setContent] = useState(question.content)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleUpdate = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      // Gọi API update question
      await apiClient(`/questions/${question.id}`, {
        method: "PATCH",
        body: JSON.stringify({ content })
      })
      
      toast({ title: "Thành công", description: "Đã cập nhật câu hỏi" })
      onSuccess?.(content)
      onOpenChange(false)
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể cập nhật câu hỏi" })
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
            className="resize-none"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={handleUpdate} disabled={loading}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}