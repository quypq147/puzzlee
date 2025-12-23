"use client"

import Link from "next/link"
import { LogIn } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-slate-800 ">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <LogIn className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Đăng nhập</CardTitle>
              <CardDescription className="text-xs">
                Truy cập dashboard để tạo và quản lý các phiên Q&A.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />

          <div className="flex items-center justify-between text-xs text-slate-400">
            <Link href="/forgot-password" className="hover:text-slate-200 underline-offset-4 hover:underline">
              Quên mật khẩu?
            </Link>
            <div className="flex items-center gap-1">
              <span>Chưa có tài khoản?</span>
              <Button asChild variant="link" size="sm" className="h-auto px-0 text-xs">
                <Link href="/register">Đăng ký ngay</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}