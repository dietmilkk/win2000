"use client";

import { startTransition, useEffect, useState } from "react";
import { Calendar, Link2, MapPin, UserPlus, UserMinus } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  loadTweets,
  getRandomCharacter,
  type Tweet,
} from "@/lib/tweets-storage";
import { Post } from "./Post";
import { Avatar } from "./Avatar";

const profileTabs = [
  "Posts",
  "Replies",
  "Highlights",
  "Media",
  "Likes",
] as const;

const BANNER_GRADIENTS = [
  "from-x-blue to-x-pink",
  "from-x-green to-x-blue",
  "from-x-pink to-purple-600",
  "from-amber-500 to-x-pink",
  "from-cyan-500 to-x-blue",
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

export function ProfileView() {
  const { isLoggedIn, openAuthModal, requireAuth } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<(typeof profileTabs)[number]>("Posts");
  const [userPosts, setUserPosts] = useState<Tweet[]>([]);
  const [profileCharacter, setProfileCharacter] = useState<{
    name: string;
    handle: string;
    avatar: string;
  } | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [bannerGradient, setBannerGradient] = useState(BANNER_GRADIENTS[0]);

  useEffect(() => {
    startTransition(() => {
      const character = getRandomCharacter();
      setProfileCharacter(character);
      setBannerGradient(
        BANNER_GRADIENTS[Math.floor(Math.random() * BANNER_GRADIENTS.length)]
      );

      const all = loadTweets();
      setUserPosts(all.filter((t) => t.authorHandle === character.handle));
    });
  }, []);

  function handleToggleFollow() {
    requireAuth(() => {
      setIsFollowing((prev) => {
        if (!prev) {
          toast(`You started following @${profileCharacter?.handle}`);
        } else {
          toast(`You unfollowed @${profileCharacter?.handle}`);
        }
        return !prev;
      });
    });
  }

  function handleShareProfile() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/profile`
        : "";
    navigator.clipboard.writeText(url);
    toast("Profile link copied!");
  }

  return (
    <section className="flex min-h-[100dvh] w-full min-w-0 max-w-[600px] flex-1 flex-col border-x border-x-border bg-x-black">
      <header className="sticky top-0 z-10 border-b border-x-border bg-x-black/90 backdrop-blur-md">
        <div className="flex h-[53px] items-center gap-4 px-3 sm:px-4">
          <XMark className="h-6 w-6 shrink-0 lg:hidden" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold leading-tight text-x-text sm:text-xl">
              {isLoggedIn ? profileCharacter?.name || "Profile" : "Profile"}
            </h1>
            <p className="truncate text-[13px] text-x-muted">
              {isLoggedIn ? `${userPosts.length} posts` : "\u00a0"}
            </p>
          </div>
        </div>
      </header>

      {!isLoggedIn ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
          <h2 className="text-[22px] font-extrabold text-x-text">
            Create an account to view this profile
          </h2>
          <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-x-muted">
            See posts, media, and more from public profiles on X. Sign in or
            sign up to continue.
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
        <>
          <div className={`h-36 w-full bg-gradient-to-br ${bannerGradient} sm:h-48`} />
          <div className="relative px-4 pb-3 pt-0">
            <Avatar
              name={profileCharacter?.name || "Perfil"}
              handle={profileCharacter?.handle || "usuario"}
              size={84}
              className="-mt-[72px] mb-3 h-[72px] w-[72px] rounded-full border-4 border-x-black object-cover sm:-mt-[84px] sm:h-[84px] sm:w-[84px]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleShareProfile}
                className="btn-press min-h-[40px] rounded-full border border-x-border px-4 py-1.5 text-[15px] font-bold text-x-text transition-colors hover:bg-x-hover"
              >
                Share
              </button>
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`btn-press min-h-[40px] rounded-full px-4 py-1.5 text-[15px] font-bold transition-colors ${
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
            <h2 className="mt-2 text-xl font-extrabold text-x-text">
              {profileCharacter?.name || "Profile"}
            </h2>
            <p className="text-[15px] text-x-muted">
              @{profileCharacter?.handle || "user"}
            </p>
            <p className="mt-3 text-[15px] text-x-text">
              Feed character — Wi-Fi, neighborhood, and questionable wisdom.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[15px] text-x-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" strokeWidth={1.75} />
                United States
              </span>
              <span className="inline-flex items-center gap-1">
                <Link2 className="h-4 w-4" strokeWidth={1.75} />
                x-clone.dev
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" strokeWidth={1.75} />
                Joined Jan 2024
              </span>
            </div>
            <div className="mt-3 flex gap-4 text-[15px] text-x-muted">
              <button type="button" className="btn-press rounded-lg px-2 py-1 hover:underline">
                <span className="font-bold text-x-text">128</span> Following
              </button>
              <button type="button" className="btn-press rounded-lg px-2 py-1 hover:underline">
                <span className="font-bold text-x-text">
                  {isFollowing ? "9,403" : "9,402"}
                </span>{" "}
                Followers
              </button>
            </div>
          </div>
          <div className="no-scrollbar flex overflow-x-auto border-b border-x-border">
            {profileTabs.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setTab(label)}
                className={`btn-press relative min-w-[72px] shrink-0 flex-1 py-3 text-center text-[14px] transition-colors sm:min-w-0 sm:text-[15px] ${
                  tab === label
                    ? "font-bold text-x-text"
                    : "font-medium text-x-muted hover:bg-x-hover/40"
                }`}
              >
                <span className="truncate px-1">{label}</span>
                {tab === label && (
                  <span className="absolute bottom-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-x-blue sm:w-14" />
                )}
              </button>
            ))}
          </div>
          <div>
            {userPosts.length === 0 ? (
              <p className="p-8 text-center text-[15px] text-x-muted">
                No posts yet.
              </p>
            ) : (
              userPosts.map((tweet) => <Post key={tweet.id} tweet={tweet} />)
            )}
          </div>
        </>
      )}
    </section>
  );
}
