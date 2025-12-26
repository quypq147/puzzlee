"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import apiClient from "@/lib/api-client"
import { Plus, Loader2 } from "lucide-react"
import { useOrganization } from "@/contexts/organization-context"

export function CreateEventDialog({
  onEventCreated,
}: {
  onEventCreated?: (event: any) => void
}) {
  // Lấy Org hiện tại từ Context
  const { currentOrganization } = useOrganization();
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("") 
  
  const { toast } = useToast()

  const handleCreate = async () => {
    if (!title.trim()) return;
    if (!currentOrganization) {
       toast({ title: "Lỗi", description: "Vui lòng chọn tổ chức trước khi tạo sự kiện", variant: "destructive" });
       return;
    }

    setLoading(true)
    try {
      const payload = {
        title,
        description,
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        organizationId: currentOrganization.id // Gửi ID Org xuống backend
      };

      const res = await apiClient.post("/events", payload);

      toast({ title: "Thành công", description: "Đã tạo sự kiện mới" })
      setOpen(false)
      setTitle(""); setDescription(""); setStartDate("");
      onEventCreated?.(res.data)
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Thất bại", 
        description: error.response?.data?.message || "Lỗi hệ thống" 
      })
    } finally {
      setLoading(false)
    }
  }

  // ... (Phần render UI giữ nguyên, chỉ thêm validate nút tạo nếu chưa có Org)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Tạo sự kiện
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo sự kiện mới</DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">
             Tổ chức: <span className="font-semibold text-primary">{currentOrganization?.name}</span>
          </div>
        </DialogHeader>
        
        {/* ... Form inputs ... */}
        <div className="grid gap-4 py-4">
             <div className="grid gap-2">
                <label>Tên sự kiện</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
             </div>
             {/* ... */}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
          <Button onClick={handleCreate} disabled={loading || !title}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tạo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}