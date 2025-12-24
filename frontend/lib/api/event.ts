import { apiClient } from "@/lib/api-client";

// Định nghĩa lại Type cho khớp với Prisma Return
export interface Event {
  id: string;
  title: string;
  description?: string;
  code: string;
  startTime?: string;
  createdAt: string;
  _count?: {
    members: number;
    questions: number;
  };
}

// Thay thế: Lấy danh sách sự kiện của tôi
export const getMyEvents = async () => {
  return apiClient<Event[]>("/events/my-events");
};

// Thay thế: Lấy chi tiết sự kiện theo Code
export const getEventByCode = async (code: string) => {
  return apiClient<Event>(`/events/code/${code}`);
};

// Thay thế: Tạo sự kiện mới
export const createEvent = async (data: { title: string; description?: string }) => {
  return apiClient<Event>("/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Thay thế: Tham gia sự kiện
export const joinEvent = async (code: string) => {
  return apiClient<{ message: string; eventId: string }>("/events/join", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
};