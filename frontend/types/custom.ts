// Định nghĩa lại User dựa trên Prisma Model
export type User = {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  avatarUrl?: string | null;
  systemRole: 'ADMIN' | 'USER';
  createdAt: string;
};

// Enum Role trong Organization
export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MEMBER';

// Type Organization (cho Context)
export type Organization = {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string | null;
  role?: OrganizationRole; // Quyền của user hiện tại trong Org này (lấy từ bảng OrganizationMember)
};

// Type Event (Cập nhật thêm organizationId)
export type Event = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  startDate: string;
  isActive: boolean;
  organizationId: string; // Quan trọng: Event giờ thuộc về Org
  creatorId?: string;
  _count?: {
    questions: number;
    members: number;
  };
};

export type Question = {
  id: string;
  content: string;
  isAnonymous: boolean;
  isPinned: boolean;
  isAnswered: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  upvotes: number;
  createdAt: string;
  author?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  } | null;
  isVoted?: boolean; 
  authorRole?: string | null; // [FIX] Thêm role của tác giả trong Event
  // [MỚI] Media hỗ trợ ảnh/video
  mediaUrl?: string;
  mediaType?: string;
};