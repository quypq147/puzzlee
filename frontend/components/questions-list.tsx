"use client"

import { useEffect, useState } from "react"
import { QuestionCard } from "./question-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface QuestionsListProps {
  eventId: string
  refreshTrigger?: number
  type?: "QA" | "POLL" | "QUIZ" // Khớp với enum backend
}

export function QuestionsList({ eventId, refreshTrigger, type }: QuestionsListProps) {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest")

  const loadQuestions = async () => {
    // [FIX 1] Kiểm tra quan trọng: Nếu chưa có eventId thì không gọi API
    if (!eventId) return;

    setLoading(true)
    try {
      const typeQuery = type ? `&type=${type}` : ""
      
      // [FIX 2] Sử dụng apiClient.get() và truy cập res.data
      const res = await apiClient.get(`/questions?eventId=${eventId}${typeQuery}`)
      
      // Kiểm tra dữ liệu trả về có phải mảng không
      if (Array.isArray(res.data)) {
        setQuestions(res.data)
      } else {
        setQuestions([])
      }
    } catch (error) {
      console.error("Failed to load questions:", error)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuestions()
  }, [eventId, refreshTrigger, type])

  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortBy === "popular") {
      // Backend trả về 'upvotes' hoặc 'score', kiểm tra field này trong console log nếu cần
      return (b.upvotes || 0) - (a.upvotes || 0)
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={sortBy === "newest" ? "default" : "outline"} onClick={() => setSortBy("newest")} size="sm">
          Mới nhất
        </Button>
        <Button variant={sortBy === "popular" ? "default" : "outline"} onClick={() => setSortBy("popular")} size="sm">
          Phổ biến nhất
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : sortedQuestions.length === 0 ? (
        <div className="rounded-lg border border-dashed py-8 text-center">
          <p className="text-muted-foreground">Chưa có dữ liệu.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedQuestions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  )
}