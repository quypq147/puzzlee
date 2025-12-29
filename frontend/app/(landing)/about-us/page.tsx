// app/(landing)/about-us/page.tsx
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="container mx-auto px-4 pt-20 pb-16 space-y-8">
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-semibold">Về ứng dụng Q&A thời gian thực</h1>
          <p className="text-sm text-slate-300">
            Dự án được xây dựng cho các lớp học, diễn đàn thảo luận và sự kiện trực tuyến, tập trung vào việc
            chuẩn hoá dữ liệu (3NF) và trải nghiệm realtime mượt mà trên nền NextJS + Supabase.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-800 bg-slate-900/80">
            <CardContent className="p-4 space-y-2 text-sm">
              <p className="font-medium">Kiến trúc dữ liệu</p>
              <p className="text-slate-300">
                Hệ thống lưu trữ <b>events</b>, <b>questions</b>, <b>answers</b>, <b>question_votes</b>,{" "}
                <b>event_members</b> và <b>notifications</b> trong schema <code>public</code>, bảo đảm toàn vẹn
                và dễ mở rộng.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80">
            <CardContent className="p-4 space-y-2 text-sm">
              <p className="font-medium">Xác thực & phân quyền</p>
              <p className="text-slate-300">
                Dùng Supabase Auth (schema <code>auth</code>) để quản lý người dùng, phiên đăng nhập, MFA…,
                map sang bảng <code>profiles</code> để hiển thị tên, avatar trong ứng dụng.
              </p>
            </CardContent>
          </Card>
        </div>

        <Button asChild variant="outline">
          <Link href="/">Quay lại trang chính</Link>
        </Button>
      </section>
    </main>
  )
}