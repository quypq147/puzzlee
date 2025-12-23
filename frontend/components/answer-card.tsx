"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { VoteButton } from "./vote-button"
import { CheckCircle } from "lucide-react"
import { RoleBadge } from "@/components/ui/role-badge" // [NEW]

interface AnswerCardProps {
  answer: {
    id: string
    content: string
    vote_count: number
    is_accepted: boolean
    created_at: string
    user: {
      display_name: string
      avatar_url?: string
    }
  }
  authorRole?: string | null // [NEW]
  onVoteChange: (answerId: string, newVotes: number) => void
}

export function AnswerCard({ answer, authorRole, onVoteChange }: AnswerCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN")
  }

  return (
    <Card className={answer.is_accepted ? "border-green-500/50 bg-green-50/50 dark:bg-green-900/10" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {answer.is_accepted && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Câu trả lời được chấp nhận</span>
              </div>
            )}
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{answer.content}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">{answer.user.display_name}</span>
            {/* [NEW] */}
            {authorRole && <RoleBadge role={authorRole} />}
          </div>
          <span>{formatDate(answer.created_at)}</span>
        </div>

        <div className="flex justify-end">
          <VoteButton
            answerId={answer.id}
            initialVotes={answer.vote_count}
            onVoteChange={(votes) => onVoteChange(answer.id, votes)}
          />
        </div>
      </CardContent>
    </Card>
  )
}