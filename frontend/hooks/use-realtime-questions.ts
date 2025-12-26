"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket"; // File cấu hình socket instance
import { Question } from "@/types/custom";

interface UseRealtimeQuestionsProps {
  eventId: string;
  onNewQuestion?: (question: Question) => void;
  onUpdateQuestion?: (question: Question) => void;
  onNewVote?: (data: { questionId: string; upvotes: number }) => void;
}

export function useRealtimeQuestions({
  eventId,
  onNewQuestion,
  onUpdateQuestion,
  onNewVote,
}: UseRealtimeQuestionsProps) {
  
  useEffect(() => {
    if (!eventId) return;

    // 1. Connect & Join Room
    if (!socket.connected) {
      socket.connect();
    }
    
    // Gửi event join room để server biết đường gửi data về đúng chỗ
    socket.emit("join-event", { eventId });
    console.log(`[Socket] Joined event room: ${eventId}`);

    // 2. Define Handlers
    const handleNewQuestion = (question: Question) => {
      console.log("[Socket] New question:", question);
      onNewQuestion?.(question);
    };

    const handleUpdateQuestion = (question: Question) => {
      console.log("[Socket] Question updated:", question);
      onUpdateQuestion?.(question);
    };

    const handleVoteUpdate = (data: { questionId: string; upvotes: number }) => {
      // console.log("[Socket] Vote updated:", data); 
      onNewVote?.(data);
    };

    // 3. Listen to Events
    socket.on("question:created", handleNewQuestion);
    socket.on("question:updated", handleUpdateQuestion);
    socket.on("vote:updated", handleVoteUpdate);

    // 4. Cleanup
    return () => {
      socket.off("question:created", handleNewQuestion);
      socket.off("question:updated", handleUpdateQuestion);
      socket.off("vote:updated", handleVoteUpdate);
      
      // Rời phòng khi unmount component
      socket.emit("leave-event", { eventId });
    };
  }, [eventId, onNewQuestion, onUpdateQuestion, onNewVote]);

  return { isConnected: socket.connected };
}