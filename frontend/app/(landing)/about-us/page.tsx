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
}"use client";
import Link from "next/link";

export default function AboutUsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 space-y-10">
      <section className="space-y-3 text-center">
        <h1 className="text-3xl font-bold">Về Puzzlee</h1>
        <p className="text-muted-foreground">
          Puzzlee là nền tảng tạo và tham gia sự kiện tương tác, giúp đội ngũ tổ
          chức xây dựng trải nghiệm vui nhộn, kết nối và đo lường hiệu quả theo
          thời gian thực.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Sứ mệnh</h2>
        <p>
          Chúng tôi mong muốn mang đến công cụ đơn giản, linh hoạt để mọi người
          có thể tạo ra các hoạt động thú vị trong lớp học, workshop,
          teambuilding hay sự kiện cộng đồng—tất cả đều dễ thiết lập, dễ tham
          gia và dễ theo dõi.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Tính năng nổi bật</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Tạo sự kiện nhanh với mã tham gia riêng.</li>
          <li>Quản lý người tham dự và cấu hình luật chơi linh hoạt.</li>
          <li>Hiển thị kết quả theo thời gian thực.</li>
          <li>Đăng nhập/đăng ký an toàn, đổi mật khẩu, quên mật khẩu.</li>
          <li>Giao diện hiện đại, tối ưu cho cả máy tính và di động.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Đội ngũ</h2>
        <p>
          Puzzlee được xây dựng bởi những người yêu công nghệ và giáo dục, luôn
          hướng đến trải nghiệm mượt mà và dễ dùng. Chúng tôi liên tục cải tiến
          dựa trên phản hồi của người dùng.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Liên hệ</h2>
        <p>
          Nếu bạn có ý tưởng, góp ý hoặc cần hỗ trợ, hãy liên hệ với chúng tôi.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="underline">
            Trang chủ
          </Link>
          <Link href="/join" className="underline">
            Tham gia sự kiện
          </Link>
          <Link href="/register" className="underline">
            Đăng ký tài khoản
          </Link>
        </div>
      </section>
    </main>
  );
}
