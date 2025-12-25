"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function UpdatePasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Token được gửi qua email dưới dạng query param: ?token=...
  const token = searchParams.get("token")

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast({ variant: "destructive", title: "Lỗi", description: "Mã xác thực không hợp lệ." })
      return
    }

    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Lỗi", description: "Mật khẩu nhập lại không khớp." })
      return
    }

    setIsLoading(true)
    try {
      // Gọi API Backend: POST /api/auth/reset-password
      await apiClient("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      })

      toast({ title: "Thành công", description: "Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại." })
      router.push("/login")
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Thất bại", 
        description: error.message || "Không thể đặt lại mật khẩu. Token có thể đã hết hạn." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
     return (
        <Card className="w-full max-w-md mx-auto">
           <CardContent className="pt-6 text-center text-red-500">
              Liên kết không hợp lệ hoặc thiếu mã xác thực.
           </CardContent>
        </Card>
     )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
          <CardDescription>Nhập mật khẩu mới cho tài khoản của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu mới</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Nhập lại mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="******"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Đang xử lý..." : "Lưu mật khẩu mới"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}