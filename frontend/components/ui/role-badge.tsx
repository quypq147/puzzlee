import { Badge } from "@/components/ui/badge"
import { Shield, ShieldCheck, User } from "lucide-react"

type EventRole = "ORGANIZER" | "MODERATOR" | "PARTICIPANT" | string;

interface RoleBadgeProps {
  role: EventRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  // Chuẩn hóa role về chữ thường hoặc hoa tùy theo dữ liệu trả về từ DB
    const r = role?.toUpperCase();

    if (r === 'HOST' || r === 'ORGANIZER') return <Badge className={`bg-red-100 text-red-700 hover:bg-red-200 border-red-200 ${className}`}>Host</Badge>
    if (r === 'MODERATOR') return <Badge className={`bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 ${className}`}>Mod</Badge>
    if (r === 'MEMBER') return <Badge variant="outline" className={className}>Thành viên</Badge>
    // [MỚI] Thêm badge cho khách/ẩn danh
    if (r === 'ANONYMOUS' || r === 'GUEST') return <Badge variant="secondary" className={`text-xs px-1 py-0 h-5 text-gray-500 ${className}`}>Khách</Badge>
    return null // Participant thường không cần badge để đỡ rối
}