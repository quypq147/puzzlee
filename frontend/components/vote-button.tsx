"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoteButtonProps {
  questionId?: string
  answerId?: string
  initialVotes: number
  userVote?: number
  onVoteChange: (newVoteCount: number) => void
}

export function VoteButton({ questionId, answerId, initialVotes, userVote, onVoteChange }: VoteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [votes, setVotes] = useState(initialVotes)
  const [currentVote, setCurrentVote] = useState<number | undefined>(userVote)

  const handleVote = async (voteType: 1 | -1) => {
    if (loading) return

    setLoading(true)
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: questionId,
          answer_id: answerId,
          vote_type: currentVote === voteType ? 0 : voteType,
        }),
      })

      if (res.ok) {
        const newVote = currentVote === voteType ? undefined : voteType
        const voteDiff = (newVote || 0) - (currentVote || 0)
        const newVotes = votes + voteDiff

        setCurrentVote(newVote)
        setVotes(newVotes)
        onVoteChange(newVotes)
      }
    } catch (error) {
      console.error("Failed to vote:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleVote(1)}
        disabled={loading}
        className={cn("h-8 w-8 p-0", currentVote === 1 && "bg-primary/20 text-primary")}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>

      <span className="text-sm font-medium min-w-[2rem] text-center">{votes}</span>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={cn("h-8 w-8 p-0", currentVote === -1 && "bg-destructive/20 text-destructive")}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  )
}
