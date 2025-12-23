"use client";

import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, Zap, BarChart3, ArrowRight } from "lucide-react"

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-primary/5 via-background to-background">
      <Header />

      <main className="flex-1">
        {/* HERO */}
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 md:flex-row md:py-20">
          {/* Left */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Zap className="h-3 w-3 text-primary" />
              Hỏi – đáp real-time cho lớp học & sự kiện
            </p>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Ứng dụng Hỏi Đáp <span className="text-primary">thời gian thực</span> cho lớp học & sự kiện trực tuyến.
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:mx-0">
              Puzzlee giúp người tham gia đặt câu hỏi, bình chọn và thảo luận ngay lập tức.
              Giảng viên & MC dễ dàng quản lý nội dung, chọn câu hỏi hay và giữ nhịp tương tác.
            </p>

            <div className="flex flex-col items-center gap-3 md:flex-row md:items-stretch">
              <Link href="/dashboard" className="w-full md:w-auto">
                <Button size="lg" className="w-full gap-2">
                  Bắt đầu ngay (miễn phí)
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/join" className="w-full md:w-auto">
                <Button size="lg" variant="outline" className="w-full">
                  Tham gia bằng mã sự kiện
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground md:justify-start">
              <span>Không cần cài đặt • Hỗ trợ mọi thiết bị</span>
              <span className="hidden h-1 w-1 rounded-full bg-muted md:inline-block" />
              <span>Real-time qua WebSocket & Supabase</span>
            </div>
          </div>

          {/* Right – mock UI */}
          <div className="flex-1 w-full">
            <Card className="mx-auto w-full max-w-md bg-background/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Phiên Q&A: Lập trình Web</span>
                  <BadgeStatus />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <MockQuestionRow author="Sinh viên 1" content="Làm sao tối ưu performance cho ứng dụng Next.js real-time?" votes={23} highlighted />
                  <MockQuestionRow author="Sinh viên 2" content="Khác nhau giữa Server Actions và API Route là gì ạ?" votes={15} />
                  <MockQuestionRow author="Khách tham dự" content="Có thể dùng Puzzlee cho hội thảo offline không?" votes={9} />
                </div>

                <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>120 người đang tham gia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>45 câu hỏi • real-time</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Thiết kế cho lớp học, workshop & sự kiện đông người</h2>
            <p className="mt-2 text-muted-foreground">Các tính năng tập trung vào việc quản lý câu hỏi hiệu quả, tránh trùng lặp, hạn chế spam và giữ trải nghiệm mượt mà.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={<MessageSquare className="h-5 w-5" />} title="Q&A real-time" description="Câu hỏi xuất hiện ngay khi gửi, được sắp xếp theo lượt bình chọn." />
            <FeatureCard icon={<Users className="h-5 w-5" />} title="Vai trò & phân quyền" description="Host, Moderator và Người tham gia với quyền hạn rõ ràng." />
            <FeatureCard icon={<Zap className="h-5 w-5" />} title="Live moderation" description="Duyệt, ẩn, highlight câu hỏi chỉ với một cú click." />
            <FeatureCard icon={<BarChart3 className="h-5 w-5" />} title="Thống kê & báo cáo" description="Theo dõi mức độ tương tác, số câu hỏi, lượt vote theo sự kiện." />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Bạn đã sẵn sàng?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">Tham gia hàng ngàn người dùng đang sử dụng Puzzlee để tạo những cuộc thảo luận tuyệt vời</p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Bắt đầu ngay (miễn phí)
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function BadgeStatus() {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Đang diễn ra
    </span>
  )
}

function MockQuestionRow({
  author,
  content,
  votes,
  highlighted,
}: {
  author: string
  content: string
  votes: number
  highlighted?: boolean
}) {
  return (
    <div
      className={[
        "flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-left",
        highlighted ? "border-primary/60 bg-primary/5" : "border-border/60 bg-muted/30",
      ].join(" ")}
    >
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground">{author}</p>
        <p className="text-sm">{content}</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-full bg-background px-2 py-1 text-[11px] font-medium">
        <span className="leading-none">{votes}</span>
        <span className="text-[9px] text-muted-foreground">votes</span>
      </div>
    </div>
  )
}

function FeatureCard(props: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="h-full border-border/60 bg-card/80 backdrop-blur">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">{props.icon}</div>
        <CardTitle className="text-sm font-semibold">{props.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{props.description}</p>
      </CardContent>
    </Card>
  );
}

export default LandingPage;
