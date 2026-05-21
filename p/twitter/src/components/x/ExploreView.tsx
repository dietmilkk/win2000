"use client";

import { useState, useMemo } from "react";
import { Search, Settings, Hash } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Avatar } from "./Avatar";

const TRENDS = [
  {
    category: "Trending in United States",
    title: "Technology",
    posts: "234K posts",
    tag: "technology",
  },
  {
    category: "Sports · Trending",
    title: "NFL",
    posts: "52.1K posts",
    tag: "nfl",
  },
  {
    category: "Entertainment · Trending",
    title: "Streaming",
    posts: "18.4K posts",
    tag: "streaming",
  },
  {
    category: "News · Trending",
    title: "Economy",
    posts: "9,902 posts",
    tag: "economy",
  },
  {
    category: "Entertainment",
    title: "SpongeBob SquarePants",
    posts: "156K posts",
    tag: "spongebob",
  },
  {
    category: "TV · Trending",
    title: "Nickelodeon",
    posts: "87.3K posts",
    tag: "nickelodeon",
  },
  {
    category: "Animated Characters",
    title: "Patrick Star",
    posts: "45.2K posts",
    tag: "patrick",
  },
  {
    category: "Cartoons",
    title: "Squidward",
    posts: "32.1K posts",
    tag: "squidward",
  },
  {
    category: "Humor · Trending",
    title: "Daily Memes",
    posts: "67.8K posts",
    tag: "memes",
  },
  {
    category: "Gaming · Trending",
    title: "GTA VI",
    posts: "112K posts",
    tag: "gta6",
  },
  {
    category: "Music · Trending",
    title: "Grammy Awards",
    posts: "89.5K posts",
    tag: "grammys",
  },
  {
    category: "Science · Trending",
    title: "Artificial Intelligence",
    posts: "41.3K posts",
    tag: "ai",
  },
];

const tabs = ["For you", "Trending", "News"] as const;

const TRENDING_PROFILES = [
  { name: "SpongeBob SquarePants", handle: "spongebob", reason: "Trending in United States" },
  { name: "Patrick Star", handle: "patrick_star", reason: "Trending in Entertainment" },
  { name: "Squidward Tentacles", handle: "squidward", reason: "Trending in Humor" },
  { name: "Mr. Krabs", handle: "mr_krabs", reason: "Trending in Business" },
];

export function ExploreView() {
  const { requireAuth } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<(typeof tabs)[number]>("For you");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const filteredTrends = useMemo(() => {
    if (!searchQuery) return TRENDS;
    return TRENDS.filter(
      (trend) =>
        trend.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trend.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  function handleTrendClick(trend: string) {
    requireAuth(() => {
      setSelectedTrend(trend);
      toast(`Exploring: #${trend}`);
    });
  }

  function toggleFollow(handle: string) {
    requireAuth(() => {
      setFollowing((prev) => {
        const next = new Set(prev);
        if (next.has(handle)) {
          next.delete(handle);
          toast(`Unfollowed @${handle}`);
        } else {
          next.add(handle);
          toast(`You started following @${handle}`);
        }
        return next;
      });
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast(`Searching for "${searchQuery}"...`);
    }
  }

  return (
    <section
      className="flex min-h-[100dvh] w-full min-w-0 max-w-[600px] flex-1 flex-col border-x border-x-border bg-x-black"
      aria-label={`Explorar — ${tab}`}
    >
      <header className="sticky top-0 z-10 border-b border-x-border bg-x-black/90 backdrop-blur-md">
        <div className="flex h-[53px] items-center justify-between px-3 sm:px-4">
          <h1 className="text-xl font-bold text-x-text">Explore</h1>
          <button
            type="button"
            className="btn-press flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-x-text transition-colors hover:bg-x-hover sm:min-h-0 sm:min-w-0 sm:p-2"
            aria-label="Explore settings"
          >
            <Settings className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
        <div className="border-b border-x-border px-3 pb-2 pt-1 sm:px-4">
          <form onSubmit={handleSearchSubmit}>
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-x-muted" />
              <input
                type="search"
                autoComplete="off"
                placeholder="Search X"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-transparent bg-x-elevated py-3 pl-12 pr-4 text-base text-x-text outline-none ring-1 ring-transparent transition-[box-shadow] placeholder:text-x-muted focus:border-x-blue focus:ring-x-blue/40 sm:text-[15px]"
              />
            </label>
          </form>
        </div>
        <div className="flex">
          {tabs.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setTab(label)}
              className={`btn-press relative flex-1 py-3 text-center text-[15px] transition-colors ${
                tab === label
                  ? "font-bold text-x-text"
                  : "font-medium text-x-muted hover:bg-x-hover/40"
              }`}
            >
              {label}
              {tab === label && (
                <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-x-blue" />
              )}
            </button>
          ))}
        </div>
      </header>

      {selectedTrend && (
        <div className="flex items-center gap-2 border-b border-x-border bg-x-blue/10 px-4 py-2">
          <Hash className="h-4 w-4 text-x-blue" />
          <span className="text-[15px] font-semibold text-x-blue">
            #{selectedTrend}
          </span>
          <button
            type="button"
            onClick={() => setSelectedTrend(null)}
            className="btn-press ml-auto rounded-full p-1 text-x-muted hover:bg-x-hover"
            aria-label="Close trend"
          >
            <span className="sr-only">Close</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="border-b border-x-border px-4 py-3">
        <h2 className="text-xl font-extrabold text-x-text">
          What&apos;s happening
        </h2>
      </div>
      {filteredTrends.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <Search className="mb-4 h-12 w-12 text-x-muted" strokeWidth={1} />
          <p className="text-[17px] font-bold text-x-text">No results found</p>
          <p className="mt-1 text-[15px] text-x-muted">
            Try searching for something else.
          </p>
        </div>
      ) : (
        filteredTrends.map((t) => (
          <button
            key={t.title}
            type="button"
            onClick={() => handleTrendClick(t.tag)}
            className={`btn-press flex w-full items-start gap-3 border-b border-x-border px-4 py-3 text-left transition-colors hover:bg-x-hover/30 ${
              selectedTrend === t.tag ? "bg-x-blue/10" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-x-muted">{t.category}</p>
              <p className="truncate text-[15px] font-bold text-x-text">
                {t.title}
              </p>
              <p className="text-[13px] text-x-muted">{t.posts}</p>
            </div>
          </button>
        ))
      )}
      <button
        type="button"
        className="btn-press w-full px-4 py-3 text-left text-[15px] text-x-blue transition-colors hover:bg-x-hover/30"
        onClick={() => {
          toast("Loading more trends...");
        }}
      >
        Show more
      </button>

      {tab === "For you" && (
        <>
          <div className="border-b border-x-border px-4 py-3">
            <h2 className="text-xl font-extrabold text-x-text">Trending profiles</h2>
          </div>
          {TRENDING_PROFILES.map((p) => {
            const isFollowing = following.has(p.handle);
            return (
              <div
                key={p.handle}
                className="flex items-center gap-3 border-b border-x-border px-4 py-3 transition-colors hover:bg-x-hover/30"
              >
                <Avatar
                  name={p.name}
                  handle={p.handle}
                  size={40}
                  className="h-10 w-10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-x-text">{p.name}</p>
                  <p className="truncate text-[13px] text-x-muted">
                    @{p.handle} · {p.reason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFollow(p.handle)}
                  className={`btn-press shrink-0 min-h-[36px] rounded-full px-4 py-1.5 text-[15px] font-bold transition-colors ${
                    isFollowing
                      ? "border border-x-border text-x-text hover:bg-x-hover"
                      : "bg-x-text text-x-black hover:opacity-90 dark:bg-[#eff3f4] dark:text-black"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}
