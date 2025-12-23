// app/dashboard/events/[code]/questions/new/page.tsx
"use client"

import { QuestionForm } from "@/components/question-form"
import { useRouter } from "next/navigation"
import { use } from "react" // <--- Bắt buộc import này

export default function NewQuestionPage({ params }: { params: Promise<{ code: string }> }) {
  // Phải dùng use() để lấy code từ params (vì params là Promise trong Next.js 15)
  const { code } = use(params)
  const router = useRouter()

  const handleCreated = () => {
    router.push(`/dashboard/events/${code}/questions/qa`)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Tạo câu hỏi mới</h2>
      {/* Lúc này code đã là string hợp lệ */}
      <QuestionForm eventId={code} onQuestionCreated={handleCreated} />
    </div>
  )
}