"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { Question } from "@/lib/api/questions";

interface UseEventRealtimeProps {
  eventId: string;
  onNewQuestion: (q: Question) => void;
  onUpdateVote: (q: Question) => void;
}

export function useEventRealtime({ eventId, onNewQuestion, onUpdateVote }: UseEventRealtimeProps) {
  useEffect(() => {
    if (!eventId) return;

    const socket = getSocket();

    // 1. Kết nối và Join room
    if (!socket.connected) socket.connect();
    socket.emit("join-event", eventId);

    // 2. Lắng nghe sự kiện
    socket.on("new-question", (newQuestion: Question) => {
      onNewQuestion(newQuestion);
    });

    socket.on("update-vote", (updatedQuestion: Question) => {
      onUpdateVote(updatedQuestion);
    });

    // 3. Cleanup
    return () => {
      socket.off("new-question");
      socket.off("update-vote");
      // socket.disconnect(); // Tùy chọn: có thể giữ kết nối để chuyển trang nhanh hơn
    };
  }, [eventId, onNewQuestion, onUpdateVote]);
}