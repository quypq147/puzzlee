"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { QuestionCard } from "./question-card"
import { Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Question } from "@/types/custom"
import { useRealtimeQuestions } from "@/hooks/use-realtime-questions"
import { toast } from "sonner"

interface RealtimeQuestionsListProps {
  eventId: string
  hostId?: string // Để check quyền nếu cần
}

export function RealtimeQuestionsList({ eventId, hostId }: RealtimeQuestionsListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest")
  // Remove queue, show new questions instantly

  // Hàm tải danh sách câu hỏi ban đầu
  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiClient.get(`/questions?eventId=${eventId}`)
      setQuestions(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error("Failed to load questions", error)
      toast.error("Không thể tải danh sách câu hỏi")
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  // Real-time: show new questions instantly
  useRealtimeQuestions({
    eventId,
    onNewQuestion: (newQ) => {
      setQuestions((prev) => [newQ, ...prev])
      toast.info("Có câu hỏi mới!", {
        description: newQ.content ? newQ.content.substring(0, 40) + "..." : "Xem ngay"
      })
    },
    onUpdateQuestion: (updatedQ) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === updatedQ.id ? { ...q, ...updatedQ } : q))
      )
    },
    onQuestionDeleted: (deletedId) => {
      setQuestions((prev) => prev.filter((q) => q.id !== deletedId))
      toast.warning("Một câu hỏi đã bị xóa.")
    }
  })

  // Sort logic
  const sortedQuestions = useMemo(() => {
    const sorted = [...questions];
    return sorted.sort((a, b) => {
      // Ghim luôn lên đầu
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (sortBy === "popular") {
        return (b.upvotes || 0) - (a.upvotes || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [questions, sortBy]);

  return (
    <div className="space-y-4">
      {/* Filter Sort */}
      <div className="flex gap-2 mb-2">
        <button
          className={`px-3 py-1 rounded ${sortBy === "newest" ? "bg-primary text-white" : "bg-muted"}`}
          onClick={() => setSortBy("newest")}
        >Mới nhất</button>
        <button
          className={`px-3 py-1 rounded ${sortBy === "popular" ? "bg-primary text-white" : "bg-muted"}`}
          onClick={() => setSortBy("popular")}
        >Phổ biến nhất</button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
      ) : sortedQuestions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
          Chưa có câu hỏi nào.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedQuestions.map((q) => (
            <QuestionCard 
              key={q.id} 
              question={q} 
              isHost={!!hostId} 
            />
          ))}
        </div>
      )}
    </div>
  )
}