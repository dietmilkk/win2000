"use client";

import { useState } from "react";
import { Bell, Heart, Repeat2, UserPlus, MessageCircle, Bookmark } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Avatar } from "./Avatar";

const subTabs = ["All", "Verified", "Mentions"] as const;

type Notification = {
  id: string;
  type: "like" | "retweet" | "follow" | "mention" | "bookmark";
  author: { name: string; handle: string };
  text?: string;
  time: string;
};

const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "like",
    author: { name: "SpongeBob SquarePants", handle: "spongebob" },
    text: "I'm ready! I'm ready! I'm ready! Who wants to Krabby Patty?",
    time: "2m",
  },
  {
    id: "n2",
    type: "retweet",
    author: { name: "Patrick Star", handle: "patrick_star" },
    text: "Is mayonnaise an instrument? No Patrick, mayonnaise is not an instrument.",
    time: "15m",
  },
  {
    id: "n3",
    type: "follow",
    author: { name: "Squidward Tentacles", handle: "squidward" },
    time: "1h",
  },
  {
    id: "n4",
    type: "mention",
    author: { name: "Mr. Krabs", handle: "mr_krabs" },
    text: "@user Hey! Did you see today's profit? 💰",
    time: "2h",
  },
  {
    id: "n5",
    type: "like",
    author: { name: "Sandy Cheeks", handle: "sandy_cheeks" },
    text: "Howdy y'all! Just finished karate practice. Now let's get some ice cream! Yee-haw!",
    time: "3h",
  },
  {
    id: "n6",
    type: "bookmark",
    author: { name: "Plankton", handle: "plankton" },
    text: "The secret formula will be mine! Soon I'll have enough money to buy the Krusty Krab!",
    time: "5h",
  },
  {
    id: "n7",
    type: "follow",
    author: { name: "Gary the Snail", handle: "gary_snail" },
    time: "8h",
  },
  {
    id: "n8",
    type: "mention",
    author: { name: "Larry the Lobster", handle: "larry_lobster" },
    text: "@user Dude, that wave was totally bodacious! 🏄",
    time: "12h",
  },
];

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

function NotificationIcon({ type }: { type: Notification["type"] }) {
  switch (type) {
    case "like":
      return <Heart className="h-5 w-5 text-x-pink" fill="currentColor" strokeWidth={1.75} />;
    case "retweet":
      return <Repeat2 className="h-5 w-5 text-x-green" strokeWidth={1.75} />;
    case "follow":
      return <UserPlus className="h-5 w-5 text-x-blue" strokeWidth={1.75} />;
    case "mention":
      return <MessageCircle className="h-5 w-5 text-x-blue" strokeWidth={1.75} />;
    case "bookmark":
      return <Bookmark className="h-5 w-5 text-x-blue" fill="currentColor" strokeWidth={1.75} />;
  }
}

export function NotificationsView() {
  const { isLoggedIn, openAuthModal } = useAuth();
  const [sub, setSub] = useState<(typeof subTabs)[number]>("All");

  return (
    <section className="flex min-h-[100dvh] w-full min-w-0 max-w-[600px] flex-1 flex-col border-x border-x-border bg-x-black">
      <header className="sticky top-0 z-10 border-b border-x-border bg-x-black/90 backdrop-blur-md">
        <div className="flex h-[53px] items-center gap-2 px-3 sm:px-4">
          <XMark className="h-6 w-6 shrink-0 lg:hidden" />
          <h1 className="text-xl font-bold text-x-text">Notifications</h1>
        </div>
        <div className="flex">
          {subTabs.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setSub(label)}
              className={`btn-press relative flex-1 py-3 text-center text-[15px] transition-colors ${
                sub === label
                  ? "font-bold text-x-text"
                  : "font-medium text-x-muted hover:bg-x-hover/40"
              }`}
            >
              {label}
              {sub === label && (
                <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-x-blue" />
              )}
            </button>
          ))}
        </div>
      </header>

      {!isLoggedIn ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-x-border bg-x-elevated/50">
            <Bell className="h-8 w-8 text-x-muted" strokeWidth={1.5} />
          </div>
          <h2 className="text-[22px] font-extrabold text-x-text">Nothing to see — yet</h2>
          <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-x-muted">
            Here are notifications about your posts, reposts, new
            followers, and more. Sign in to see yours.
          </p>
          <button
            type="button"
            onClick={openAuthModal}
            className="btn-press mt-6 min-h-[44px] rounded-full bg-x-text px-6 py-2.5 text-[15px] font-bold text-x-black transition-colors dark:bg-white dark:text-black"
          >
            Sign in
          </button>
        </div>
      ) : (
        <div>
          {NOTIFICATIONS.map((n) => (
            <article
              key={n.id}
              className="btn-press flex gap-3 border-b border-x-border px-4 py-3 transition-colors hover:bg-x-hover/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-start justify-center pt-1">
                <NotificationIcon type={n.type} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[15px]">
                  <Avatar
                    name={n.author.name}
                    handle={n.author.handle}
                    size={24}
                    className="h-6 w-6"
                  />
                  <span className="font-bold text-x-text">{n.author.name}</span>
                  <span className="text-x-muted">@{n.author.handle}</span>
                  <span className="text-x-muted">·</span>
                  <time className="text-x-muted">{n.time}</time>
                </div>
                {n.text && (
                  <p className="mt-1 text-[15px] text-x-text">{n.text}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
