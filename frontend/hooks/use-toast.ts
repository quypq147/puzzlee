"use client"

import { toast as sonnerToast, ExternalToast } from "sonner"

type ToastType = "success" | "error" | "info" | "warning"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive" // Giữ tương thích với shadcn cũ nếu cần
}

// Wrapper để tương thích với cách gọi toast({ title, description }) cũ
export function useToast() {
  function toast({ title, description, variant }: ToastProps) {
    const options: ExternalToast = {
      description,
    }

    if (variant === "destructive") {
      sonnerToast.error(title, options)
    } else {
      sonnerToast.success(title, options)
    }
  }

  return { toast }
}