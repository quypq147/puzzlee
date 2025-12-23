import { Badge } from "@/components/ui/badge"
import { Shield, ShieldCheck, User } from "lucide-react"

type EventRole = "ORGANIZER" | "MODERATOR" | "PARTICIPANT" | string;

interface RoleBadgeProps {
  role: EventRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  // Chuẩn hóa role về chữ thường hoặc hoa tùy theo dữ liệu trả về từ DB
  const normalizedRole = role?.toUpperCase();

  if (normalizedRole === "ORGANIZER") {
    return (
      <Badge variant="default" className={`bg-primary/90 hover:bg-primary gap-1 ${className}`}>
        <ShieldCheck className="w-3 h-3" />
        Tổ chức
      </Badge>
    );
  }

  if (normalizedRole === "MODERATOR") {
    return (
      <Badge variant="secondary" className={`bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 gap-1 ${className}`}>
        <Shield className="w-3 h-3" />
        Điều phối
      </Badge>
    );
  }

  // Mặc định là Participant thì không hiện hoặc hiện badge đơn giản tùy bạn
  return null; 
}