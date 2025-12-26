"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
// [EDIT] Bỏ import supabase
// import { api } from "@/lib/api"; 
import { useAuth } from "@/hooks/use-auth"; // [EDIT] Dùng hook mới
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast"; // Thêm toast để thông báo

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { register } = useAuth(); // [EDIT] Lấy hàm register từ context
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  // Backend User model hiện tại chỉ cần username/fullName, ta gộp firstName/secondName
  const [firstName, setFirstName] = useState(""); 
  const [secondName, setSecondName] = useState("");
  const [username, setUsername] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateUsernameFormat = (u: string) => /^[a-zA-Z0-9_\.\-]{3,32}$/.test(u);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate client-side cơ bản
    if (password !== repeatPassword) {
      setError("Mật khẩu không khớp");
      setIsLoading(false);
      return;
    }

    if (username && !validateUsernameFormat(username)) {
      setError("Username phải 3-32 ký tự, chỉ chữ/số/._-");
      setIsLoading(false);
      return;
    }

    try {
      // [EDIT] Gọi hàm register từ AuthContext (nó sẽ gọi API /api/auth/register)
      // Gộp firstName và secondName thành fullName để khớp với schema backend
      const fullName = `${firstName} ${secondName}`.trim();
      
      await register({
        email,
        password,
        username,
        fullName: fullName// Fallback nếu không nhập tên
      });

      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng đăng nhập để tiếp tục.",
      });
      
      // useAuth.register đã xử lý redirect sang /login
      
    } catch (error: any) {
      // Error từ backend trả về (ví dụ: Email exist, Username exist)
      setError(error.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Đăng ký</CardTitle>
          <CardDescription>Tạo tài khoản mới hệ thống Puzzlee</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">Tên đầu</Label>
                  <Input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nguyễn"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="second-name">Tên cuối</Label>
                  <Input
                    id="second-name"
                    value={secondName}
                    onChange={(e) => setSecondName(e.target.value)}
                    placeholder="Văn A"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nguyenvana"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="repeat-password">Nhập lại mật khẩu</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Đăng ký"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Bạn đã có tài khoản?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Đăng nhập
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}