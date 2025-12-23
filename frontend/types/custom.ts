// types/custom.ts
import { Database } from './supabase';

export type Question = Database['public']['Tables']['questions']['Row'];
export type QuestionOption = Database['public']['Tables']['question_options']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Type mở rộng để hiển thị UI
export type QuestionExtended = Question & {
  profiles: Profile | null; // Người tạo
  question_options?: (QuestionOption & {
    response_count?: number; // Số lượng người chọn (tính từ poll_responses)
    is_voted_by_me?: boolean; // User hiện tại đã chọn option này chưa
  })[];
  user_vote_value?: number; // Cho Q&A: 1 (Upvote) hoặc -1 (Downvote)
  answers_count?: number; // Số lượng bình luận
};