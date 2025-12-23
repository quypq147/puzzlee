// lib/api/questions.ts
import { QuestionType } from "@/types/custom"; // Import type vừa tạo

interface CreateQuestionPayload {
  event_id: string;
  content: string;
  type: QuestionType;
  is_anonymous: boolean;
  options?: { content: string; is_correct: boolean }[];
}

export async function createQuestion(payload: CreateQuestionPayload) {
  const res = await fetch("/api/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create question");
  }

  return res.json();
}

// Hàm fetch danh sách (nếu dùng client-side fetching)
export async function getQuestionsByEvent(eventId: string) {
  const res = await fetch(`/api/questions?event_id=${eventId}`);
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
}
export async function updateQuestion(id: string, data: { content?: string; is_pinned?: boolean; status?: string }) {
  const res = await fetch(`/api/questions/${id}`, { // Lưu ý đường dẫn api, nếu bạn dùng app/actions/... làm API thì sửa lại url
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  // Fallback nếu bạn dùng route app/actions/questions/[id]
  // const res = await fetch(`/actions/questions/${id}`, ... ); 

  if (!res.ok) throw new Error("Failed to update question");
  return res.json();
}
export async function deleteQuestion(id: string) {
  const res = await fetch(`/api/questions/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete question");
  return res.json();
}
export async function moderateQuestion(id: string, action: 'pin' | 'hide' | 'show' | 'answer') {
  const res = await fetch(`/api/questions/${id}/moderate`, { // Gọi vào route riêng hoặc dùng PATCH chung
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  if (!res.ok) throw new Error("Failed to moderate question");
  return res.json();
}
export async function getQuestionsForAdmin(eventId: string) {
  // Thêm param include_hidden=true để admin thấy cả câu đã ẩn
  const res = await fetch(`/api/questions?event_id=${eventId}&include_hidden=true`);
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
}