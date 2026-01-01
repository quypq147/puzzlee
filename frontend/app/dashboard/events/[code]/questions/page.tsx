"use client"

import { use, useEffect, useState } from "react"
import { QuestionManager } from "@/components/events/question-manager"
import { apiClient } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

export default function EventQuestionsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const [eventData, setEventData] = useState<any>(null)

  // Cần lấy ID sự kiện từ code để truyền vào QuestionManager (vì DB dùng UUID làm khóa ngoại)
  useEffect(() => {
    apiClient.get(`/events/${code}/details`)
      .then(res => setEventData(res.data))
      .catch(err => console.error(err))
  }, [code])

  if (!eventData) return <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>

    return (
     <div className="h-full p-4 md:p-6 bg-[#f8f9fb] dark:bg-[#122017]">
      {/* [SỬA 1] Thêm 'flex flex-col' để quản lý chiều cao dọc */}
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        {/* Header giữ nguyên chiều cao tự nhiên */}
        <div className="mb-4 flex-none">
          <h2 className="text-2xl font-bold tracking-tight">Quản lý câu hỏi</h2>
          <p className="text-muted-foreground">Duyệt, ghim và trả lời câu hỏi từ người tham gia.</p>
        </div>
        {/* [SỬA 2] Wrapper này giúp QuestionManager chỉ chiếm phần còn lại (flex-1) và không bị tràn (min-h-0) */}
        <div className="flex-1 min-h-0">
          <QuestionManager eventId={eventData.id} eventCode={code} />
        </div>
      </div>
     </div>
    )
}