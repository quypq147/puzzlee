// frontend/types/custom.ts

export type UserRole = "USER" | "ADMIN";
export type EventRole = "PARTICIPANT" | "MODERATOR" | "HOST";
export type QuestionStatus = "VISIBLE" | "HIDDEN" | "ANSWERED";

export interface User {
  id: string;
  email: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  code: string;
  isActive: boolean;
  startTime: string | null; // JSON trả về string cho Date
  createdAt: string;
  _count?: {
    members: number;
    questions: number;
  };
}

export interface Question {
  id: string;
  eventId: string;
  content: string;
  isAnonymous: boolean;
  status: QuestionStatus;
  isPinned: boolean;
  isAnswered: boolean;
  score: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
  userVote?: number; // 1 (upvote) hoặc 0
}