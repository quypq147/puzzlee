"use client";

import { toast as sonnerToast } from "sonner";

type POSITION = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface ToastData {
  title: string;
  description?: string;
  duration?: number;
  position?: POSITION;
}

type ToastType = "success" | "error" | "warning" | "info";

/**
 * Hook mỏng quấn quanh sonner, để dùng trong UI Q&A
 */
export function useToast() {
  const base = (type: ToastType, data: ToastData) => {
    const { title, description, duration, position } = data;

    return sonnerToast(title, {
      description,
      duration: duration ?? 3000,
      position: mapPosition(position ?? "top-right"),
      // icon sẽ lấy theo type do bạn đã config trong <Toaster icons={...} />
      // variant & kiểu màu đã set bởi style trong sonner.tsx
    });
  };

  return {
    success: (data: ToastData) => base("success", data),
    error: (data: ToastData) => base("error", data),
    warning: (data: ToastData) => base("warning", data),
    info: (data: ToastData) => base("info", data),
    // nếu cần dùng sonnerToast thô:
    raw: sonnerToast,
  };
}

function mapPosition(pos: POSITION): import("sonner").ToasterProps["position"] {
  // Sonner dùng: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
  // Bạn hiện chỉ cần 4 góc, nên map thẳng
  return pos;
}
