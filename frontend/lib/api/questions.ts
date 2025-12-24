import { apiClient } from "@/lib/api-client";

export interface Question {
  id: string;
  content: string;
  score: number;
  isAnonymous: boolean;
  status: "VISIBLE" | "HIDDEN" | "ANSWERED";
  createdAt: string;
  author: {
    id: string;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
  userVote: number; // 1, -1, 0 (Lấy từ backend)
}

// Thay thế: Lấy danh sách câu hỏi ban đầu
export const getQuestions = async (eventId: string) => {
  return apiClient<Question[]>(`/questions/event/${eventId}`);
};