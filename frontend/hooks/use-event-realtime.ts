"use client";

import { useRealtimeQuestions } from "./use-realtime-questions";
import { Question } from "@/types/custom";

interface UseEventRealtimeProps {
  eventId: string;
  onNewQuestion?: (q: Question) => void;
  onUpdateVote?: (data: any) => void;
}

// Wrapper để tương thích ngược (nếu cần)
export function useEventRealtime({ eventId, onNewQuestion, onUpdateVote }: UseEventRealtimeProps) {
  useRealtimeQuestions({
    eventId,
    onNewQuestion,
    onNewVote: onUpdateVote
  });
}