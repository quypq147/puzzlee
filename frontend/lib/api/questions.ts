import { apiClient } from "@/lib/api-client";
import { Question } from "@/types/custom";

export const questionApi = {
  // Lấy danh sách câu hỏi của 1 event
  getByEvent: (eventId: string) => 
    apiClient.get<Question[]>(`/questions?eventId=${eventId}`),

  // Tạo câu hỏi mới
  create: (data: { content: string; eventId: string; isAnonymous: boolean }) => 
    apiClient.post<Question>('/questions', data),

  // Vote (Upvote/Downvote)
  vote: (questionId: string, type: 'UPVOTE' | 'DOWNVOTE') => 
    apiClient.post(`/questions/${questionId}/vote`, { type }),

  // [MỚI] Hàm update đa năng cho Admin (Ghim, Ẩn, Trả lời)
  update: (questionId: string, data: { isPinned?: boolean; isAnswered?: boolean; status?: string }) => 
    apiClient.patch<Question>(`/questions/${questionId}`, data),
    
  delete: (questionId: string) =>
    apiClient.delete(`/questions/${questionId}`),
};