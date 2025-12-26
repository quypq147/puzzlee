'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth' // Sử dụng hook auth thay vì supabase

export function LogoutButton() {
  const { logout } = useAuth()

  // Hàm logout trong useAuth đã bao gồm việc xóa token và redirect về login
  const handleLogout = () => {
    logout()
  }

  return <Button onClick={handleLogout}>Đăng Xuất</Button>
}