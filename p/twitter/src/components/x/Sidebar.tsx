"use client";

import { Home, Bell, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Avatar } from "./Avatar";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile" },
] as const;

function XMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { requireAuth } = useAuth();
  const { toast } = useToast();

  function renderIcon(href: string, active: boolean) {
    if (href === "/profile") {
      return (
        <Avatar name="Profile" handle="user" size={26} className="h-[26px] w-[26px] shrink-0 ring-1 ring-x-border" />
      );
    }
    const iconMap: Record<string, typeof Home> = { "/": Home, "/explore": Search, "/notifications": Bell };
    const Icon = iconMap[href];
    if (!Icon) return null;
    return (
      <Icon className="h-[26px] w-[26px] shrink-0 text-x-text" strokeWidth={active ? 2.75 : 1.75} aria-hidden />
    );
  }

  return (
    <header className="sticky top-0 z-30 hidden h-screen w-[72px] shrink-0 flex-col items-center border-r border-x-border bg-x-black py-1 sm:w-[88px] lg:flex xl:w-[275px] xl:items-stretch xl:px-2">
      <div className="flex flex-1 flex-col items-center xl:items-stretch xl:pr-2">
        <Link
          href="/"
          className="btn-press mb-2 flex h-[52px] w-[52px] min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-x-text transition-colors hover:bg-x-hover xl:ml-2"
          aria-label="X"
        >
          <XMark className="h-[26px] w-[26px]" />
        </Link>
        <nav className="flex flex-col gap-1">
          {nav.map(({ href, label }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`btn-press group flex min-h-[48px] min-w-[48px] items-center gap-5 rounded-full p-3 transition-colors hover:bg-x-hover xl:min-h-0 xl:min-w-0 xl:pr-6 ${
                  active ? "font-bold" : "font-normal"
                }`}
              >
                {renderIcon(href, active)}
                <span className="hidden text-xl text-x-text xl:inline">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => requireAuth(() => toast("Open post composer..."))}
          className="btn-press mt-4 hidden w-full max-w-[90%] min-h-[48px] rounded-full bg-x-blue py-3.5 text-center text-[17px] font-bold text-white transition-colors xl:block"
        >
          Post
        </button>
        <button
          type="button"
          onClick={() => requireAuth(() => toast("Open post composer..."))}
          className="btn-press mt-4 flex h-14 w-14 min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-x-blue text-white transition-colors xl:hidden"
          aria-label="Post"
        >
          <XMark className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
