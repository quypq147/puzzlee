// frontend/components/dialog/guest-identity-dialog.tsx
"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
// ... imports UI components

export function GuestIdentityDialog() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [open, setOpen] = useState(false);

  // Load thông tin đã lưu khi vào trang
  useEffect(() => {
    const saved = localStorage.getItem("guest_identity");
    if (saved) {
      const parsed = JSON.parse(saved);
      setName(parsed.name);
      setCompany(parsed.company);
    } else {
      // Nếu chưa có tên, tự động mở dialog nhắc nhở (giống Slido)
      setOpen(true);
    }
  }, []);

  const handleSave = () => {
    const identity = { name, company };
    localStorage.setItem("guest_identity", JSON.stringify(identity));
    setOpen(false);
    // Có thể cần reload hoặc dùng Context để cập nhật state toàn app
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Button trigger trên Nav */}
      <DialogTrigger asChild>
        <Button variant="ghost">{name || "Đặt tên của bạn"}</Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader><DialogTitle>Tham gia với tên</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Tên của bạn" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Công ty / Lớp học (Tuỳ chọn)" value={company} onChange={e => setCompany(e.target.value)} />
          <Button onClick={handleSave}>Lưu thông tin</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}