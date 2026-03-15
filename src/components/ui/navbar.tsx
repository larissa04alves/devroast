import Link from "next/link";

export function Navbar() {
  return (
    <nav className="w-full h-14 bg-bg-page border-b border-border-primary flex items-center justify-between px-10">
      {/* Logo */}
      <Link href="/" className="inline-flex items-center gap-2">
        <span className="font-mono text-[20px] font-bold text-accent-green" aria-hidden="true">
          &gt;
        </span>
        <span className="font-mono text-[18px] font-medium text-text-primary">devroast</span>
      </Link>

      {/* Nav direita */}
      <div className="flex items-center gap-6">
        <Link
          href="/leaderboard"
          className="font-mono text-[13px] text-text-secondary hover:text-text-primary transition-colors duration-150"
        >
          leaderboard
        </Link>
      </div>
    </nav>
  );
}
