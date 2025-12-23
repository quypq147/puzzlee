"use client"

import { ArrowLeft, KeyRound } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/90">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Quên mật khẩu</CardTitle>
              <CardDescription className="text-xs">
                Nhập email của bạn, hệ thống sẽ gửi link đặt lại mật khẩu.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ForgotPasswordForm />

          <Button asChild variant="ghost" size="sm" className="mt-2 text-xs gap-1">
            <Link href="/(auth)/login">
              <ArrowLeft className="w-3 h-3" />
              Quay lại đăng nhập
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
