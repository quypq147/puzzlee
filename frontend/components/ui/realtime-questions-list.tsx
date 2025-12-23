"use client"

import { useEffect, useState, useCallback } from "react"
import { QuestionCard } from "./question-card"
import { Button } from "@/components/ui/button"
import { Loader2, Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface RealtimeQuestionsListProps {
  eventId: string
}

export function RealtimeQuestionsList({ eventId }: RealtimeQuestionsListProps) {
  const supabase = createClient()
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest")
  const [newQuestionsCount, setNewQuestionsCount] = useState(0)

  const loadQuestions = useCallback(async () => {
    try {
      const res = await fetch(`/api/questions?event_id=${eventId}`)
      if (res.ok) {
        const data = await res.json()
        setQuestions(data)
        setNewQuestionsCount(0)
      }
    } catch (error) {
      console.error("Failed to load questions:", error)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    loadQuestions()

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`questions:event_id=eq.${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "questions",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log("[v0] New question received:", payload.new)
          setNewQuestionsCount((c) => c + 1)
          // Auto-refresh after a short delay
          setTimeout(() => loadQuestions(), 500)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "questions",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log("[v0] Question updated:", payload.new)
          setQuestions((prev) => prev.map((q) => (q.id === payload.new.id ? payload.new : q)))
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "votes",
        },
        (payload) => {
          console.log("[v0] Vote updated:", payload.new)
          // Refresh to update vote counts
          loadQuestions()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, supabase, loadQuestions])

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
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button variant={sortBy === "newest" ? "default" : "outline"} onClick={() => setSortBy("newest")} size="sm">
            Mới nhất
          </Button>
          <Button variant={sortBy === "popular" ? "default" : "outline"} onClick={() => setSortBy("popular")} size="sm">
            Phổ biến nhất
          </Button>
        </div>

        {newQuestionsCount > 0 && (
          <Button size="sm" variant="outline" onClick={() => loadQuestions()} className="gap-2">
            <Bell className="h-4 w-4" />
            Có {newQuestionsCount} câu hỏi mới
          </Button>
        )}
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
