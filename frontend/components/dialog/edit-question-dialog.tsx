"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {apiClient} from "@/lib/api-client"
import { Loader2 } from "lucide-react"

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
      // PATCH /questions/:id
      await apiClient.patch(`/questions/${question.id}`, { 
        content 
      })
      
      toast({ title: "Thành công", description: "Đã cập nhật câu hỏi" })
      onSuccess?.(content)
      onOpenChange(false)
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Lỗi", 
        description: error.response?.data?.message || "Không thể cập nhật câu hỏi" 
      })
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
            placeholder="Nội dung câu hỏi..."
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>Hủy</Button>
          <Button onClick={handleUpdate} disabled={loading || !content.trim()}>
             {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}