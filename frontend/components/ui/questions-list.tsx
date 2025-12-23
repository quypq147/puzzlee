"use client"

import { useEffect, useState } from "react"
import { QuestionCard } from "./question-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface QuestionsListProps {
  eventId: string
  refreshTrigger?: number
}

export function QuestionsList({ eventId, refreshTrigger }: QuestionsListProps) {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest")

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/questions?event_id=${eventId}`)
      if (res.ok) {
        const data = await res.json()
        setQuestions(data)
      }
    } catch (error) {
      console.error("Failed to load questions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuestions()
  }, [eventId, refreshTrigger])

  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortBy === "popular") {
      return b.vote_count - a.vote_count
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const handleVoteChange = (questionId: string, newVotes: number) => {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, vote_count: newVotes } : q)))
  }

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
          <p className="text-muted-foreground">Chưa có câu hỏi nào. Hãy đặt câu hỏi đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} eventId={eventId} onVoteChange={handleVoteChange} />
          ))}
        </div>
      )}
    </div>
  )
}
