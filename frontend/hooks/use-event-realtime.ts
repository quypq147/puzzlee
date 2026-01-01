"use client";

import { useRealtimeQuestions } from "./use-realtime-questions";
import { Question } from "@/types/custom";

interface UseEventRealtimeProps {
  eventId: string;
  onNewQuestion?: (q: Question) => void;
  onUpdateVote?: (data: any) => void;
  onQuestionDeleted?: (id: string) => void; // Thêm props này
}

export function useEventRealtime({ eventId, onNewQuestion, onUpdateVote, onQuestionDeleted }: UseEventRealtimeProps) {
  useRealtimeQuestions({
    eventId,
    onNewQuestion,
    onNewVote: onUpdateVote,
    onQuestionDeleted: onQuestionDeleted // Truyền xuống
  });
}