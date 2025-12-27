"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useEventRealtime } from "@/hooks/use-event-realtime"; // Hook socket đã tạo
import {questionApi} from "@/lib/api/questions"// API mới
import { Question } from "@/types/custom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuestionCard } from "@/components/question-card"; // Component UI cũ
import { useToast } from "@/components/ui/use-toast";
import { socket } from "@/lib/socket";

interface RoomProps {
  eventId: string; // ID của sự kiện (lấy từ API getEventByCode ở page cha)
  eventCode: string;
}

export default function EventRoom({ eventId, eventCode }: RoomProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newContent, setNewContent] = useState("");

  // 1. Tải dữ liệu ban đầu
  useEffect(() => {
    questionApi.getByEvent(eventId).then(res => setQuestions(res.data)).catch(console.error);
  }, [eventId]);

  // 2. Kích hoạt Socket Realtime
  useEventRealtime({
    eventId,
    onNewQuestion: (q) => {
      setQuestions((prev) => [q, ...prev]);
    },
    onUpdateVote: (updatedQ) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === updatedQ.id ? { ...q, score: updatedQ.score } : q))
      );
    },
  });

  // 3. Gửi câu hỏi mới (qua Socket hoặc API đều được, ở đây dùng Socket cho nhanh)
  const handleAsk = () => {
    if (!newContent.trim()) return;
    
    // Emit sự kiện socket lên server
    const socketInstance = socket;
    socketInstance.emit("create-question", {
      eventId,
      userId: user?.id,
      content: newContent,
      isAnonymous: false // Có thể thêm toggle ẩn danh
    });

    setNewContent("");
    toast({ title: "Đã gửi câu hỏi!" });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Form đặt câu hỏi */}
      <div className="bg-card p-4 rounded-lg border shadow-sm space-y-4">
        <Textarea
          placeholder="Đặt câu hỏi của bạn..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <div className="flex justify-end">
          <Button onClick={handleAsk}>Gửi câu hỏi</Button>
        </div>
      </div>

      {/* Danh sách câu hỏi */}
      <div className="space-y-4">
        {questions.map((q) => (
          <QuestionCard key={q.id} question={q} />
        ))}
      </div>
    </div>
  );
}