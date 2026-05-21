"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { createTweet, loadTweets, saveTweets, type Tweet } from "@/lib/tweets-storage";
import { PostComposer } from "./PostComposer";
import { Post } from "./Post";
import { useToast } from "@/contexts/toast-context";
import { useAuth } from "@/contexts/auth-context";

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

export function Feed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"foryou" | "following">("foryou");
  const { toast } = useToast();
  const { requireAuth } = useAuth();

  useEffect(() => {
    startTransition(() => {
      setTweets(loadTweets());
      setMounted(true);
    });
  }, []);

  const handlePost = useCallback((text: string) => {
    const tw = createTweet(text);
    setTweets((prev) => {
      const next = [tw, ...prev];
      saveTweets(next);
      return next;
    });
    toast("Post published successfully!");
  }, [toast]);

  const handleTabChange = useCallback(
    (newTab: "foryou" | "following") => {
      if (newTab === "following") {
        requireAuth(() => setTab(newTab));
      } else {
        setTab(newTab);
      }
    },
    [requireAuth]
  );

  const visible = useMemo(() => {
    if (tab === "foryou") return tweets;
    return tweets.filter((_, i) => i % 2 === 0);
  }, [tweets, tab]);

  if (!mounted) {
    return (
      <section className="flex min-h-[100dvh] min-w-0 w-full max-w-[600px] flex-1 flex-col border-x border-x-border bg-x-black">
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-x-border bg-x-black/90 px-3 py-3 backdrop-blur-md sm:px-4">
          <XMark className="h-6 w-6 shrink-0 lg:hidden" />
          <h1 className="text-lg font-bold text-x-text sm:text-xl">Home</h1>
        </div>
        <div className="h-32 animate-pulse bg-x-hover/20" />
      </section>
    );
  }

  return (
    <section className="flex min-h-[100dvh] min-w-0 w-full max-w-[600px] flex-1 flex-col border-x border-x-border bg-x-black">
      <div className="sticky top-0 z-10 border-b border-x-border bg-x-black/90 backdrop-blur-md">
        <div className="flex h-[52px] items-center gap-2 px-3 sm:h-[53px] sm:px-4">
          <XMark className="h-6 w-6 shrink-0 lg:hidden" />
          <div className="flex min-w-0 flex-1">
            <button
              type="button"
              onClick={() => handleTabChange("foryou")}
              className={`btn-press relative flex flex-1 flex-col items-center justify-center py-3 text-[14px] transition-colors sm:text-[15px] ${
                tab === "foryou"
                  ? "font-bold text-x-text"
                  : "font-medium text-x-muted hover:bg-x-hover/50"
              }`}
            >
              For you
              {tab === "foryou" && (
                <span className="absolute bottom-0 h-1 w-12 rounded-full bg-x-blue sm:w-14" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("following")}
              className={`btn-press relative flex flex-1 flex-col items-center justify-center py-3 text-[14px] transition-colors sm:text-[15px] ${
                tab === "following"
                  ? "font-bold text-x-text"
                  : "font-medium text-x-muted hover:bg-x-hover/50"
              }`}
            >
              Following
              {tab === "following" && (
                <span className="absolute bottom-0 h-1 w-12 rounded-full bg-x-blue sm:w-14" />
              )}
            </button>
          </div>
        </div>
      </div>
      <PostComposer onPost={handlePost} />
      <div className="min-h-0 flex-1">
        {visible.length === 0 ? (
          <p className="p-6 text-center text-[15px] text-x-muted">
            Nothing here in this tab.
          </p>
        ) : (
          visible.map((tweet) => <Post key={tweet.id} tweet={tweet} />)
        )}
      </div>
    </section>
  );
}
