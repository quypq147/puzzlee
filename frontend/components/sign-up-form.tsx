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

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateUsernameFormat = (u: string) => /^[a-zA-Z0-9_\.\-]{3,32}$/.test(u);

  const checkUsernameAvailability = async (u: string) => {
    if (!u) {
      setIsUsernameAvailable(null);
      return;
    }
    setIsCheckingUsername(true);
    const supabase = createClient();
    const { data: existing, error: usernameError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", u)
      .maybeSingle();
    if (usernameError) {
      setIsUsernameAvailable(null);
    } else {
      setIsUsernameAvailable(!existing);
    }
    setIsCheckingUsername(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

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

    // Check username uniqueness in profiles
    if (username) {
      const { data: existing, error: usernameError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();
      if (usernameError) {
        setError("Không thể kiểm tra username, thử lại sau");
        setIsLoading(false);
        return;
      }
      if (existing) {
        setError("Username đã tồn tại, vui lòng chọn tên khác");
        setIsLoading(false);
        return;
      }
    }

    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
          data: {
            first_name: firstName || null,
            second_name: secondName || null,
            username: username || null,
            avatar_url: avatarUrl || null,
            role: "user",
          },
        },
      });
      if (error) throw error;
      if (signUpData?.user) {
        await (supabase as any)
          .from("profiles")
          .upsert(
            {
              id: signUpData.user.id,
              first_name: firstName || null,
              second_name: secondName || null,
              username: username || null,
              avatar_url: avatarUrl || null,
            },
            { onConflict: "id" }
          );
      }
      router.push("/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Đăng ký</CardTitle>
          <CardDescription>Tạo tài khoản mới</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">Tên đầu</Label>
                  <Input
                    id="first-name"
                    type="text"
                    placeholder="Nguyễn"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="second-name">Tên cuối</Label>
                  <Input
                    id="second-name"
                    type="text"
                    placeholder="Văn A"
                    value={secondName}
                    onChange={(e) => setSecondName(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="nguyenvana"
                  value={username}
                  onChange={(e) => {
                    const v = e.target.value;
                    setUsername(v);
                    const valid = validateUsernameFormat(v);
                    setIsUsernameValid(v ? valid : null);
                    setIsUsernameAvailable(null);
                  }}
                  onBlur={() => {
                    if (username && validateUsernameFormat(username)) {
                      checkUsernameAvailability(username);
                    }
                  }}
                />
                {username && (
                  <p className="text-xs">
                    {isCheckingUsername && (
                      <span className="text-zinc-500">Đang kiểm tra username…</span>
                    )}
                    {!isCheckingUsername && isUsernameValid === false && (
                      <span className="text-red-500">Username không hợp lệ.</span>
                    )}
                    {!isCheckingUsername && isUsernameValid && isUsernameAvailable === false && (
                      <span className="text-red-500">Username đã tồn tại.</span>
                    )}
                    {!isCheckingUsername && isUsernameValid && isUsernameAvailable && (
                      <span className="text-green-600">Username hợp lệ và khả dụng.</span>
                    )}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Nhập lại mật khẩu</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading ||
                  (username
                    ? isUsernameValid === false ||
                      isCheckingUsername ||
                      isUsernameAvailable === false
                    : false)
                }
              >
                {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
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
