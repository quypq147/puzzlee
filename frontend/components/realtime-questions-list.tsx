"use client"

import { useEffect, useState, useCallback } from "react"
import { QuestionCard } from "./question-card"
import { Button } from "@/components/ui/button"
import { Loader2, Bell } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useEventRealtime } from "@/hooks/use-event-realtime"
import { Question } from "@/types/custom"

interface RealtimeQuestionsListProps {
  eventId: string
  hostId?: string // Để check quyền nếu cần
}

export function RealtimeQuestionsList({ eventId, hostId }: RealtimeQuestionsListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest")
  const [newQuestionsQueue, setNewQuestionsQueue] = useState<Question[]>([])

  // Hàm tải danh sách câu hỏi ban đầu
  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true)
      // Gọi API Node.js: GET /api/questions?eventId=...
      const data = await apiClient<Question[]>(`/questions?eventId=${eventId}`)
      setQuestions(data || [])
      setNewQuestionsQueue([]) // Reset hàng đợi khi reload
    } catch (error) {
      console.error("Failed to load questions:", error)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  // Tích hợp Real-time (Socket.io)
  useEventRealtime({
    eventId,
    onNewQuestion: (newQ) => {
      // Khi có câu hỏi mới, đưa vào hàng đợi thông báo (tránh nhảy layout đột ngột)
      setNewQuestionsQueue((prev) => [newQ, ...prev])
    },
    onUpdateVote: (updatedQ) => {
      // Cập nhật vote ngay lập tức
      setQuestions((prev) => 
        prev.map((q) => (q.id === updatedQ.id ? { ...q, score: updatedQ.score } : q))
      )
    }
  })

  // Hàm merge câu hỏi mới vào danh sách chính
  const handleLoadNewQuestions = () => {
    setQuestions((prev) => [...newQuestionsQueue, ...prev])
    setNewQuestionsQueue([])
  }

  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortBy === "popular") {
      // Ưu tiên score cao, nếu bằng thì cái nào mới hơn lên trên
      return (b.score || 0) - (a.score || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    // Mới nhất
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="space-y-4">
      {/* Header & Filter */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button variant={sortBy === "newest" ? "default" : "outline"} onClick={() => setSortBy("newest")} size="sm">
            Mới nhất
          </Button>
          <Button variant={sortBy === "popular" ? "default" : "outline"} onClick={() => setSortBy("popular")} size="sm">
            Phổ biến nhất
          </Button>
        </div>

        {newQuestionsQueue.length > 0 && (
          <Button size="sm" variant="outline" onClick={handleLoadNewQuestions} className="gap-2 animate-pulse border-primary text-primary">
            <Bell className="h-4 w-4" />
            Có {newQuestionsQueue.length} câu hỏi mới
          </Button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : sortedQuestions.length === 0 ? (
        <div className="rounded-lg border border-dashed py-8 text-center">
          <p className="text-muted-foreground">Chưa có câu hỏi nào. Hãy đặt câu hỏi đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedQuestions.map((q) => (
            <QuestionCard 
              key={q.id} 
              question={q} 
              // Truyền thêm prop nếu cần thiết để xử lý logic vote/delete trong Card
            />
          ))}
        </div>
      )}
    </div>
  )
}
