"use client";


import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { Question } from "@/types/custom";
import { toast } from "sonner";

interface UseRealtimeQuestionsProps {
  eventId: string;
  onNewQuestion?: (question: Question) => void;
  onUpdateQuestion?: (question: Question) => void;
  onNewVote?: (data: { questionId: string; upvotes: number }) => void;
  onQuestionDeleted?: (questionId: string) => void;
}

export function useRealtimeQuestions({
  eventId,
  onNewQuestion,
  onUpdateQuestion,
  onNewVote,
  onQuestionDeleted,
}: UseRealtimeQuestionsProps) {
  useEffect(() => {
    if (!eventId) return;

    if (!socket.connected) {
      socket.connect();
    }
    
    socket.emit("join-event", { eventId });
    console.log(`[Socket] Joined event room: ${eventId}`);

    // Handler: Câu hỏi mới
    const handleNewQuestion = (question: Question) => {
      onNewQuestion?.(question);
      toast("Có câu hỏi mới!", { description: question.content.substring(0, 30) + "..." });
    };

    // Handler: Update câu hỏi (Vote, Ghim, Ẩn...)
    const handleUpdateQuestion = (question: Question) => {
      onUpdateQuestion?.(question);
    };

    // Handler: Vote update (chỉ số lượng)
    const handleVoteUpdate = (data: { questionId: string; upvotes: number }) => {
      onNewVote?.(data);
    };

    // [MỚI] Handler: Câu hỏi bị xóa -> Xóa ngay lập tức khỏi UI
    const handleQuestionDeleted = (data: { id: string }) => {
       console.log("[Socket] Question deleted:", data.id);
       onQuestionDeleted?.(data.id);
       toast.info("Một câu hỏi đã bị xóa bởi quản trị viên.");
    };

    // [MỚI] Handler: Người tham gia mới -> Hiện Toast
    const handleParticipantJoined = (data: any) => {
        toast.success(`${data.guestName} đã tham gia sự kiện!`);
    };

    // [MỚI] Handler: Bình luận mới -> Hiện Toast
    const handleCommentCreated = (data: any) => {
        toast.message(`Bình luận mới từ ${data.guestName || data.author?.fullName || 'Ai đó'}`, {
            description: data.content
        });
    };

    // Listen events
    socket.on("question:created", handleNewQuestion);
    socket.on("question:updated", handleUpdateQuestion);
    socket.on("vote:updated", handleVoteUpdate);
    socket.on("question:deleted", handleQuestionDeleted);     // Listen Delete
    socket.on("participant:joined", handleParticipantJoined); // Listen Join
    socket.on("comment:created", handleCommentCreated);       // Listen Comment

    return () => {
      socket.off("question:created", handleNewQuestion);
      socket.off("question:updated", handleUpdateQuestion);
      socket.off("vote:updated", handleVoteUpdate);
      socket.off("question:deleted", handleQuestionDeleted);
      socket.off("participant:joined", handleParticipantJoined);
      socket.off("comment:created", handleCommentCreated);
      
      socket.emit("leave-event", { eventId });
    };
  }, [eventId, onNewQuestion, onUpdateQuestion, onNewVote, onQuestionDeleted]);

  return { isConnected: socket.connected };
}