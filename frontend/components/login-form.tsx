"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // Determine if identifier is an email or username
      const isEmail = /@/.test(identifier);
      let emailToUse = identifier;

      if (!isEmail) {
        // Lookup email by username from profiles
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", identifier)
          .maybeSingle();
        if (profileError) {
          setError("Không thể kiểm tra username, vui lòng thử lại.");
          return;
        }
        if (!profile) {
          setError("Username không tồn tại.");
          return;
        }
        // Fetch auth user to get email
        const { data: userData, error: userError } = await supabase
          .from("auth.users")
          .select("email")
          .eq("id", profile.id)
          .maybeSingle();
        if (userError) {
          setError("Không thể lấy email cho username này.");
          return;
        }
        if (!userData?.email) {
          setError("Tài khoản không có email hợp lệ.");
          return;
        }
        emailToUse = userData.email as string;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });
      if (error) {
        if (error.message === "Email not confirmed") {
          setError(
            "Bạn cần xác nhận email trước khi đăng nhập. Vui lòng kiểm tra hộp thư."
          );
        } else if (error.message === "Invalid login credentials") {
          setError("Email hoặc mật khẩu không đúng.");
        } else {
          setError(error.message ?? "Có lỗi xảy ra, vui lòng thử lại.");
        }
        return;
      }
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra, vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập email của bạn bên dưới để đăng nhập vào tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="identifier">Email</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="m@example.com"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mật khẩu</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
