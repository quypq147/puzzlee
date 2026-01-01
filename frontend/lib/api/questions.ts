import { apiClient } from "@/lib/api-client";
import { Question } from "@/types/custom";

export const questionApi = {
  // Lấy danh sách câu hỏi của 1 event
  getByEvent: (eventId: string) => 
    apiClient.get<Question[]>(`/questions?eventId=${eventId}`),

  // Tạo câu hỏi mới (Hỗ trợ cả Poll/Quiz)
  create: (data: { 
    content: string; 
    eventId: string; 
    isAnonymous: boolean;
    type?: string; 
    pollOptions?: { content: string; isCorrect: boolean }[] 
  }) => 
    apiClient.post<Question>('/questions', data),

  // Vote (Upvote/Downvote)
  vote: (questionId: string, type: 'UPVOTE' | 'DOWNVOTE', guestId?: string) => 
    apiClient.post(`/questions/${questionId}/vote`, { type, guestId }),

  // Hàm update đa năng cho Admin (Ghim, Ẩn, Trả lời)
  update: (questionId: string, data: { isPinned?: boolean; isAnswered?: boolean; status?: string }) => 
    apiClient.patch<Question>(`/questions/${questionId}`, data),
    
  delete: (questionId: string) =>
    apiClient.delete(`/questions/${questionId}`),
  // [MỚI] Lấy danh sách bình luận
  getAnswers: (questionId: string) => 
    apiClient.get<any[]>(`/answers/${questionId}`),

  // [MỚI] Gửi bình luận/trả lời
  createAnswer: (data: { questionId: string; content: string; guestName?: string }) => 
    apiClient.post('/answers', data),

  // [MỚI] Vote cho Poll/Quiz
  votePoll: (questionId: string, optionId: string, guestId?: string) => 
    apiClient.post(`/questions/${questionId}/poll-vote`, { questionId, optionId, guestId }),
};

// [QUAN TRỌNG] Export hàm này để QuestionForm sử dụng
export const createQuestion = questionApi.create;