"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // dùng hàm cn bạn đã có
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Tính năng", href: "#features" },
  { label: "Hướng dẫn", href: "#how-it-works" },
];

type NavbarItemProps = {
  href: string;
  label: string;
};

function NavbarItem({ href, label }: NavbarItemProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
        isActive && "text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

export function Header() {
  const { user, profile, loading } = useAuth();
  const firstLetter =
    profile?.full_name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "?";

  // Avoid showing wrong auth state during initial load
  if (loading) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
        {/* Logo */}
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Puzzlee
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            Q&A
          </span>
        </Link>

        {/* Nav */}
        <nav className="ml-10 hidden space-x-6 md:flex">
          {navItems.map((item) => (
            <NavbarItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  <Avatar className="h-8 w-8">
                    {profile?.avatar_url ? (
                      <AvatarImage
                          src={profile.avatar_url}
                          alt={`${profile?.first_name ?? ""} ${profile?.second_name ?? ""} avatar image`}
                        />
                    ) : null}
                    <AvatarFallback>{firstLetter}</AvatarFallback>
                  </Avatar>
                </Link>
              </div>

              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;