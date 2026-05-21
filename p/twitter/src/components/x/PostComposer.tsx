"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  BarChart2,
  Smile,
  CalendarClock,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getRandomCharacter } from "@/lib/tweets-storage";
import { Avatar } from "./Avatar";

type PostComposerProps = {
  onPost: (text: string) => void;
};

export function PostComposer({ onPost }: PostComposerProps) {
  const { requireAuth } = useAuth();
  const [text, setText] = useState("");
  const [character] = useState(() => getRandomCharacter());

  function handlePost() {
    const trimmed = text.trim();
    if (!trimmed) return;
    requireAuth(() => {
      onPost(trimmed);
      setText("");
    });
  }

  const charCount = 280 - text.length;
  const charCountColor = charCount < 0 ? "text-x-pink" : charCount < 20 ? "text-x-blue" : "text-x-muted";

  return (
    <div className="border-b border-x-border px-3 py-3 sm:px-4">
      <div className="flex gap-2 sm:gap-3">
        <Avatar
          name={character.name}
          handle={character.handle}
          size={40}
          className="mt-1 h-9 w-9 shrink-0 ring-1 ring-x-border sm:h-10 sm:w-10"
        />
        <div className="min-w-0 flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={text.length > 100 ? 4 : 2}
            maxLength={280}
            placeholder="What's happening?"
            className="w-full resize-none bg-transparent text-[17px] leading-snug text-x-text placeholder:text-x-muted transition-[min-height] duration-150 focus:outline-none sm:text-xl"
          />
          <div className="mt-3 flex flex-col gap-3 border-t border-x-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="no-scrollbar flex min-h-[44px] flex-nowrap items-center gap-0.5 overflow-x-auto text-x-blue sm:min-h-0 sm:gap-1">
              <button
                type="button"
                onClick={() => requireAuth(() => {})}
                className="btn-press flex shrink-0 items-center justify-center rounded-full p-2.5 transition-colors hover:bg-x-blue/10 sm:p-2"
                aria-label="Media"
              >
                <ImageIcon className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => requireAuth(() => {})}
                className="btn-press flex shrink-0 items-center justify-center rounded-full px-2.5 py-2.5 transition-colors hover:bg-x-blue/10 sm:py-2"
                aria-label="GIF"
              >
                <span className="text-sm font-bold">GIF</span>
              </button>
              <button
                type="button"
                onClick={() => requireAuth(() => {})}
                className="btn-press flex shrink-0 items-center justify-center rounded-full p-2.5 transition-colors hover:bg-x-blue/10 sm:p-2"
                aria-label="Poll"
              >
                <BarChart2 className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => requireAuth(() => {})}
                className="btn-press flex shrink-0 items-center justify-center rounded-full p-2.5 transition-colors hover:bg-x-blue/10 sm:p-2"
                aria-label="Emoji"
              >
                <Smile className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => requireAuth(() => {})}
                className="btn-press flex shrink-0 items-center justify-center rounded-full p-2.5 transition-colors hover:bg-x-blue/10 sm:p-2"
                aria-label="Schedule"
              >
                <CalendarClock className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex items-center justify-end gap-3 sm:justify-start">
              {text.length > 0 && (
                <span className={`text-sm tabular-nums ${charCountColor}`}>
                  {charCount}
                </span>
              )}
              <button
                type="button"
                onClick={handlePost}
                disabled={!text.trim()}
                className="btn-press min-h-[44px] min-w-[88px] rounded-full bg-x-blue px-5 text-[15px] font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0 sm:min-w-0 sm:px-4 sm:py-1.5"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
