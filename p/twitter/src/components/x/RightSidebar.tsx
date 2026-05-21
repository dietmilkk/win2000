"use client";

import { Search, MoreHorizontal, Sun, Moon, UserPlus, UserMinus, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Avatar } from "./Avatar";
import { getRandomCharacter } from "@/lib/tweets-storage";

const TRENDS = [
  { category: "Trending in United States", title: "Technology", posts: "234K posts", tag: "technology" },
  { category: "Sports · Trending", title: "NFL", posts: "52.1K posts", tag: "nfl" },
  { category: "Entertainment · Trending", title: "Streaming", posts: "18.4K posts", tag: "streaming" },
  { category: "News · Trending", title: "Economy", posts: "9,902 posts", tag: "economy" },
  { category: "Entertainment", title: "SpongeBob SquarePants", posts: "156K posts", tag: "spongebob" },
  { category: "TV · Trending", title: "Nickelodeon", posts: "87.3K posts", tag: "nickelodeon" },
  { category: "Animated Characters", title: "Patrick Star", posts: "45.2K posts", tag: "patrick" },
  { category: "Cartoons", title: "Squidward", posts: "32.1K posts", tag: "squidward" },
  { category: "Humor · Trending", title: "Daily Memes", posts: "67.8K posts", tag: "memes" },
  { category: "Gaming · Trending", title: "GTA VI", posts: "112K posts", tag: "gta6" },
];

const SUGGESTION_HANDLES = [
  "spongebob",
  "patrick_star",
  "squidward",
  "mr_krabs",
  "sandy_cheeks",
  "plankton",
  "gary_snail",
  "larry_lobster",
  "karen_plankton",
];

export function RightSidebar() {
  const { requireAuth } = useAuth();
  const { toast } = useToast();
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem("x-clone-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return stored === "light" || stored === "dark"
      ? stored
      : prefersDark
        ? "dark"
        : "light";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [following, setFollowing] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    const stored = window.localStorage.getItem("x-clone-following");
    if (stored) {
      try {
        return new Set(JSON.parse(stored) as string[]);
      } catch {
        // ignore
      }
    }
    return new Set();
  });
  const [suggestions] = useState<
    { name: string; handle: string }[]
  >(() => {
    const chars = SUGGESTION_HANDLES.map(() => {
      const c = getRandomCharacter();
      return { name: c.name, handle: c.handle };
    });
    const unique = chars.filter(
      (c, i, arr) => arr.findIndex((x) => x.handle === c.handle) === i
    );
    return unique.slice(0, 4);
  });
  const [activeTrend, setActiveTrend] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (following.size > 0) {
      window.localStorage.setItem(
        "x-clone-following",
        JSON.stringify(Array.from(following))
      );
    }
  }, [following]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem("x-clone-theme", next);
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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast(`Searching for "${searchQuery}"...`);
      setSearchQuery("");
    }
  }

  function handleTrendClick(trend: string) {
    setActiveTrend(trend);
    toast(`Exploring: #${trend}`);
  }

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery) return suggestions;
    return suggestions.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.handle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suggestions, searchQuery]);

  const filteredTrends = useMemo(() => {
    if (!searchQuery) return TRENDS;
    return TRENDS.filter(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <aside className="hidden w-[350px] shrink-0 flex-col gap-4 py-2 pl-6 lg:flex xl:w-[380px]">
      <div className="sticky top-2 flex max-h-[calc(100vh-16px)] flex-col gap-4 overflow-y-auto">
        <form onSubmit={handleSearch} className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-x-muted" />
          <input
            type="search"
            autoComplete="off"
            placeholder="Search X"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-transparent bg-x-elevated py-3 pl-12 pr-4 text-base text-x-text outline-none ring-1 ring-transparent transition-[box-shadow] placeholder:text-x-muted focus:border-x-blue focus:ring-x-blue/40 sm:text-[15px]"
          />
        </form>

        <div className="overflow-hidden rounded-2xl bg-x-elevated">
          <div className="px-4 py-3">
            <h2 className="text-xl font-extrabold text-x-text">What&apos;s happening</h2>
          </div>
          <div className="no-scrollbar max-h-[350px] overflow-y-auto">
            {filteredTrends.map((t) => (
              <button
                key={t.title}
                type="button"
                onClick={() => handleTrendClick(t.tag)}
                className={`btn-press flex w-full items-start gap-2 px-4 py-3 text-left transition-colors hover:bg-x-hover/60 ${
                  activeTrend === t.tag ? "bg-x-blue/10" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-x-muted">{t.category}</p>
                  <p className="truncate font-bold text-x-text">{t.title}</p>
                  <p className="text-[13px] text-x-muted">{t.posts}</p>
                </div>
                <MoreHorizontal className="h-[18px] w-[18px] shrink-0 text-x-muted" />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => toast("Loading more trends...")}
            className="btn-press w-full px-4 py-3 text-left text-[15px] text-x-blue transition-colors hover:bg-x-hover/60"
          >
            Show more
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl bg-x-elevated">
          <div className="px-4 py-3">
            <h2 className="text-xl font-extrabold text-x-text">Who to follow</h2>
          </div>
          <div className="no-scrollbar max-h-[350px] overflow-y-auto">
            {filteredSuggestions.map((u) => {
              const isFollowing = following.has(u.handle);
              return (
                <div
                  key={u.handle}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-x-hover/60"
                >
                  <Avatar
                    name={u.name}
                    handle={u.handle}
                    size={40}
                    className="h-10 w-10 shrink-0 ring-1 ring-x-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-x-text">{u.name}</p>
                    <p className="truncate text-[15px] text-x-muted">
                      @{u.handle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFollow(u.handle)}
                    className={`btn-press shrink-0 min-h-[36px] rounded-full px-4 py-1.5 text-[15px] font-bold transition-colors ${
                      isFollowing
                        ? "border border-x-border text-x-text hover:bg-x-hover"
                        : "bg-x-text text-x-black hover:opacity-90 dark:bg-[#eff3f4] dark:text-black"
                    }`}
                  >
                    {isFollowing ? (
                      <span className="flex items-center gap-1">
                        <UserMinus className="h-4 w-4" />
                        Following
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <UserPlus className="h-4 w-4" />
                        Follow
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => toast("Loading more suggestions...")}
            className="btn-press w-full px-4 py-3 text-left text-[15px] text-x-blue transition-colors hover:bg-x-hover/60"
          >
            Show more
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-press flex items-center justify-center gap-2 rounded-full border border-x-border bg-x-elevated px-4 py-2.5 text-[15px] font-semibold text-x-text transition-colors hover:bg-x-hover/60"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Moon className="h-5 w-5" strokeWidth={1.75} />
            )}
            {theme === "dark" ? "Light mode" : "Dark mode (X)"}
          </button>

          <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 text-[13px] text-x-muted">
            <button type="button" className="btn-press hover:underline">Terms of Service</button>
            <button type="button" className="btn-press hover:underline">Privacy Policy</button>
            <button type="button" className="btn-press hover:underline">Cookie Policy</button>
            <button type="button" className="btn-press hover:underline">Accessibility</button>
            <button type="button" className="btn-press hover:underline">Ads Info</button>
            <span className="flex items-center gap-1">
              More <ExternalLink className="h-3 w-3" />
            </span>
            <span>© 2025 X Corp.</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
