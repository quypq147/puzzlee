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
      <div className="max-w-5xl mx-auto h-full">
         <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Quản lý câu hỏi</h2>
            <p className="text-muted-foreground">Duyệt, ghim và trả lời câu hỏi từ người tham gia.</p>
         </div>
         
         {/* Render trình quản lý */}
         <div className="h-[calc(100vh-180px)]">
            <QuestionManager eventId={eventData.id} eventCode={code} />
         </div>
      </div>
    </div>
  )
}