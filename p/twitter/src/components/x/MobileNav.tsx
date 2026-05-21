"use client";

import { Home, Bell, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useToast } from "@/contexts/toast-context";
import { Avatar } from "./Avatar";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Search", icon: Search },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile" },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const { toast } = useToast();

  function renderIcon(item: typeof items[number], active: boolean) {
    if (item.href === "/profile") {
      return (
        <Avatar name="Profile" handle="user" size={26} className={`h-[26px] w-[26px] ${active ? "ring-2 ring-x-blue" : "ring-1 ring-x-border"}`} />
      );
    }
    const iconMap: Record<string, typeof Home> = { "/": Home, "/explore": Search, "/notifications": Bell };
    const Icon = iconMap[item.href];
    return (
      <Icon className={`h-[26px] w-[26px] ${active ? "text-x-text" : ""}`} strokeWidth={active ? 2.75 : 1.75} aria-hidden />
    );
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-[calc(3.5rem+env(safe-area-inset-bottom))] items-start justify-around border-t border-x-border bg-x-black/90 px-1 pt-1 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Main navigation"
    >
      {items.map((item) => {
        const { href, label } = item;
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => toast(label)}
            className="btn-press flex min-h-[48px] min-w-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-x-muted transition-colors"
            aria-current={active ? "page" : undefined}
          >
            {renderIcon(item, active)}
            <span className="sr-only">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
