"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  Repeat2,
  Heart,
  BarChart2,
  Bookmark,
  Share,
  MoreHorizontal,
} from "lucide-react";
import type { Tweet } from "@/lib/tweets-storage";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Avatar } from "./Avatar";

const REACTIONS = ["😂", "🔥", "💀", "☕", "👀"] as const;

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return `${Math.max(1, Math.floor(diff))}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

type PostProps = {
  tweet: Tweet;
};

export function Post({ tweet }: PostProps) {
  const { requireAuth } = useAuth();
  const { toast } = useToast();
  const displayName = tweet.authorName ?? "Você";
  const handle = tweet.authorHandle ?? "usuario";

  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    () => 12 + (tweet.id.charCodeAt(0) % 40)
  );
  const [replyBump, setReplyBump] = useState(0);
  const [viewBump, setViewBump] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reactions, setReactions] = useState<Record<string, boolean>>({});

  const replyBase = useMemo(
    () => 1 + (tweet.id.length % 9) + (tweet.text.length % 5),
    [tweet.id, tweet.text.length]
  );
  const viewBase = useMemo(
    () => 800 + (tweet.id.charCodeAt(2) % 400) * 3,
    [tweet.id]
  );

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  function toggleLike() {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      if (!prev) toast("Post liked!");
      return !prev;
    });
  }

  function toggleRetweet() {
    setRetweeted((v) => {
      if (!v) toast("Post reposted!");
      return !v;
    });
  }

  function toggleBookmark() {
    setBookmarked((b) => {
      if (!b) {
        toast("Post saved to bookmarks!");
      } else {
        toast("Post removed from bookmarks");
      }
      return !b;
    });
  }

  async function copyShareLink() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/?post=${encodeURIComponent(tweet.id)}`
        : "";
    await navigator.clipboard.writeText(url);
    toast("Link copied!");
  }

  function toggleReaction(emoji: string) {
    setReactions((prev) => ({ ...prev, [emoji]: !prev[emoji] }));
  }

  const iconBtn =
    "btn-press group flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-1 rounded-full px-1 text-x-muted transition-colors sm:min-h-0 sm:min-w-0 sm:px-2";

  return (
    <article className="relative border-b border-x-border px-3 py-3 transition-colors hover:bg-x-hover/30 sm:px-4">
      <div className="absolute right-1 top-2 sm:right-2" ref={menuRef}>
        <button
          type="button"
          onClick={() => requireAuth(() => setMenuOpen((o) => !o))}
          className="btn-press flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-x-muted transition-colors hover:bg-x-hover hover:text-x-text"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="More options"
        >
          <MoreHorizontal className="h-[20px] w-[20px]" strokeWidth={1.75} />
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 w-64 overflow-hidden rounded-xl border border-x-border bg-x-black py-1 text-[15px] shadow-xl"
          >
            <button
              type="button"
              role="menuitem"
              className="btn-press block w-full px-4 py-3 text-left text-x-text transition-colors hover:bg-x-hover"
              onClick={() => {
                setMenuOpen(false);
                toast("Post hidden from your feed");
              }}
            >
              Not interested in this post
            </button>
            <button
              type="button"
              role="menuitem"
              className="btn-press block w-full px-4 py-3 text-left text-x-text transition-colors hover:bg-x-hover"
              onClick={() => {
                setMenuOpen(false);
                toast(`You started following @${handle}`);
              }}
            >
              Follow @{handle}
            </button>
            <button
              type="button"
              role="menuitem"
              className="btn-press block w-full px-4 py-3 text-left text-x-text transition-colors hover:bg-x-hover"
              onClick={() => {
                setMenuOpen(false);
                requireAuth(() => void copyShareLink());
              }}
            >
              Copy link to post
            </button>
            <button
              type="button"
              role="menuitem"
              className="btn-press block w-full px-4 py-3 text-left text-x-text transition-colors hover:bg-x-hover"
              onClick={() => {
                setMenuOpen(false);
                toast("Post reported. Thank you for helping keep X safe.");
              }}
            >
              Report post
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2 sm:gap-3">
        <Avatar
          name={displayName}
          handle={handle}
          size={40}
          className="mt-0.5 h-10 w-10 shrink-0 ring-1 ring-x-border"
        />
        <div className="min-w-0 flex-1 pr-8 sm:pr-10">
          <div className="flex flex-wrap items-baseline gap-x-1.5 text-[14px] leading-5 sm:text-[15px]">
            <span className="truncate font-bold text-x-text">{displayName}</span>
            <span className="truncate text-x-muted">@{handle}</span>
            <span className="text-x-muted">·</span>
            <time
              className="shrink-0 text-x-muted"
              dateTime={new Date(tweet.createdAt).toISOString()}
            >
              {formatTime(tweet.createdAt)}
            </time>
          </div>
          <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-snug text-x-text">
            {tweet.text}
          </p>

          <div
            className="mt-1.5 flex flex-wrap gap-1"
            role="group"
            aria-label="Reações"
          >
            {REACTIONS.map((emoji) => {
              const on = reactions[emoji];
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => toggleReaction(emoji)}
                  className={`btn-press rounded-md border px-1.5 py-0.5 text-[12px] leading-none text-x-muted transition-colors hover:bg-x-hover/50 ${
                    on
                      ? "border-x-border/80 bg-x-hover/30 text-x-text"
                      : "border-transparent bg-transparent opacity-80 hover:opacity-100"
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>

          <div className="-ml-1 mt-1.5 flex max-w-full flex-wrap items-center justify-between gap-y-1 text-[13px] sm:-ml-2 sm:max-w-[540px]">
            <button
              type="button"
              onClick={() => requireAuth(() => { setReplyBump((n) => n + 1); toast("Reply sent!"); })}
              className={`${iconBtn} hover:text-x-blue`}
            >
              <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <span className="min-w-[1.25rem] tabular-nums group-hover:text-x-blue">
                {replyBase + replyBump}
              </span>
            </button>
            <button
              type="button"
              onClick={() => requireAuth(toggleRetweet)}
              className={`${iconBtn} ${retweeted ? "text-x-green" : ""} hover:text-x-green`}
            >
              <Repeat2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <span className="tabular-nums">{retweeted ? 1 : 0}</span>
            </button>
            <button
              type="button"
              onClick={() => requireAuth(toggleLike)}
              className={`${iconBtn} ${liked ? "text-x-pink" : ""} hover:text-x-pink`}
              aria-pressed={liked}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={liked ? "on" : "off"}
                  initial={{ scale: 0.92 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 520, damping: 22 }}
                  className="inline-flex will-change-transform"
                >
                  <Heart
                    className="h-[18px] w-[18px]"
                    strokeWidth={1.75}
                    fill={liked ? "currentColor" : "none"}
                  />
                </motion.span>
              </AnimatePresence>
              <span className="tabular-nums">{likeCount}</span>
            </button>
            <button
              type="button"
              onClick={() => requireAuth(() => setViewBump((n) => n + 1))}
              className={`${iconBtn} hover:text-x-blue`}
            >
              <BarChart2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <span className="tabular-nums">
                {formatCount(viewBase + viewBump * 7)}
              </span>
            </button>
            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => requireAuth(toggleBookmark)}
                className={`${iconBtn} ${bookmarked ? "text-x-blue" : ""} hover:text-x-blue`}
                aria-pressed={bookmarked}
              >
                <Bookmark
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.75}
                  fill={bookmarked ? "currentColor" : "none"}
                />
              </button>
              <button
                type="button"
                onClick={() => requireAuth(() => void copyShareLink())}
                className={`${iconBtn} hover:text-x-blue`}
                aria-label="Share"
              >
                <Share className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
