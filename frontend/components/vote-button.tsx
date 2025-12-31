"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { questionApi } from "@/lib/api/questions"
import { useToast } from "@/components/ui/use-toast"

// Hàm helper để lấy hoặc tạo Guest ID
function getGuestId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("guest_id");
  if (!id) {
    id = crypto.randomUUID(); // Tạo UUID mới
    localStorage.setItem("guest_id", id);
  }
  return id;
}

interface VoteButtonProps {
  questionId?: string
  initialVotes: number
  userVote?: number
  onVoteChange?: (newVoteCount: number) => void
}

export function VoteButton({ questionId, initialVotes, userVote, onVoteChange }: VoteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [votes, setVotes] = useState(initialVotes)
  const [currentVote, setCurrentVote] = useState<number>(userVote || 0)
  const { toast } = useToast()

  const handleVote = async (voteType: 1 | -1) => {
    if (!questionId || loading) return

    // Optimistic UI Update
    const previousVote = currentVote
    const previousCount = votes
    const newVoteType = currentVote === voteType ? 0 : voteType // Toggle logic (nếu muốn)
    
    // Lưu ý: Logic backend hiện tại là Upsert (luôn update), chưa hỗ trợ xóa vote (về 0).
    // Tạm thời frontend cứ gửi đè vote mới.
    
    // Tính số vote mới để hiển thị ngay
    // Nếu chuyển từ 0 -> 1: +1
    // Nếu chuyển từ -1 -> 1: +2
    let diff = 0;
    if (newVoteType === 1 && previousVote === 0) diff = 1;
    if (newVoteType === 1 && previousVote === -1) diff = 2;
    if (newVoteType === -1 && previousVote === 0) diff = -1;
    if (newVoteType === -1 && previousVote === 1) diff = -2;
    
    // Vì backend hiện tại chưa hỗ trợ "Unvote" (về 0), 
    // nên nếu bấm lại nút đã chọn, ta tạm thời KHÔNG làm gì hoặc giữ nguyên.
    if (newVoteType === 0) return; 

    setVotes(votes + diff)
    setCurrentVote(newVoteType)
    if (onVoteChange) onVoteChange(votes + diff)
    
    setLoading(true)

    try {
      // Lấy Guest ID
      const guestId = getGuestId();

      await questionApi.vote(
        questionId, 
        voteType === 1 ? 'UPVOTE' : 'DOWNVOTE', 
        guestId // Gửi guestId lên
      )
    } catch (error) {
      console.error("Failed to vote:", error)
      toast({
        title: "Lỗi",
        description: "Không thể gửi bình chọn",
        variant: "destructive"
      })
      // Revert lại nếu lỗi
      setVotes(previousCount)
      setCurrentVote(previousVote)
      if (onVoteChange) onVoteChange(previousCount)
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
        className={cn("h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600", currentVote === 1 && "bg-green-100 text-green-600")}
      >
        <ThumbsUp className={cn("h-4 w-4", currentVote === 1 && "fill-current")} />
      </Button>

      <span className="text-sm font-medium min-w-8 text-center">{votes}</span>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={cn("h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600", currentVote === -1 && "bg-red-100 text-red-600")}
      >
        <ThumbsDown className={cn("h-4 w-4", currentVote === -1 && "fill-current")} />
      </Button>
    </div>
  )
}