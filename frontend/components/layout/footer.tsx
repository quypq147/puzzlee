import Link from "next/link";

function Footer() {
  return (
    <footer className="mt-12 border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground md:flex-row">
        <p>© 2025 Puzzlee Q&A. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-foreground">
            Điều khoản
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Bảo mật
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
