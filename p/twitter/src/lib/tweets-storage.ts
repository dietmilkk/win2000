export type Tweet = {
  id: string;
  text: string;
  createdAt: number;
  avatarSrc?: string;
  authorName?: string;
  authorHandle?: string;
};

const STORAGE_KEY = "x-clone-tweets";

const base = 1_745_000_000_000;

const CHARACTER_AVATARS = [
  {
    name: "SpongeBob SquarePants",
    handle: "spongebob",
    avatar: "/avatars/spongebob.png",
  },
  {
    name: "Patrick Star",
    handle: "patrick_star",
    avatar: "/avatars/patrick.png",
  },
  {
    name: "Squidward Tentacles",
    handle: "squidward",
    avatar: "/avatars/squidward.png",
  },
  { name: "Mr. Krabs", handle: "mr_krabs", avatar: "/avatars/mrkrabs.png" },
  {
    name: "Sandy Cheeks",
    handle: "sandy_cheeks",
    avatar: "/avatars/sandy.png",
  },
  { name: "Plankton", handle: "plankton", avatar: "/avatars/plankton.png" },
  { name: "Gary the Snail", handle: "gary_snail", avatar: "/avatars/gary.png" },
  {
    name: "Larry the Lobster",
    handle: "larry_lobster",
    avatar: "/avatars/larry.png",
  },
  {
    name: "Karen Plankton",
    handle: "karen_plankton",
    avatar: "/avatars/karen.png",
  },
];

// Frases típicas dos personagens
const CHARACTER_QUOTES = [
  "I'm ready! I'm ready! I'm ready!",
  "Is mayonnaise an instrument?",
  "Can I take your order?",
  "Money! Money! Money!",
  "Howdy y'all! Yee-haw!",
  "The secret formula will be mine!",
  "Meow... Meow... Meow...",
  "Dude, that wave was totally bodacious!",
  "Honey, don't forget to pay attention to your wife.",
  "I hate Mondays.",
  "Jellyfish jam is the best!",
  "Krusty Krab Pizza, it's the pizza for you and me!",
  "Imagination!",
  "F is for friends who do stuff together!",
  "Absorbent and yellow and porous is he!",
  "We should go to the beach!",
  "Karate! Woo! Ha ha!",
  "Plankton's computer wife!",
  "I'm ugly and I'm proud!",
  "Free samples!",
];

export const seedTweets: Tweet[] = [
  {
    id: "seed-meme-1",
    authorName: "SpongeBob SquarePants",
    authorHandle: "spongebob",
    avatarSrc: "/avatars/spongebob.png",
    text: "I'm ready! I'm ready! I'm ready! Who wants to Krabby Patty?",
    createdAt: base - 1000 * 60 * 12,
  },
  {
    id: "seed-meme-2",
    authorName: "Patrick Star",
    authorHandle: "patrick_star",
    avatarSrc: "/avatars/patrick.png",
    text: "Is mayonnaise an instrument? No Patrick, mayonnaise is not an instrument.",
    createdAt: base - 1000 * 60 * 45,
  },
  {
    id: "seed-meme-3",
    authorName: "Squidward Tentacles",
    authorHandle: "squidward",
    avatarSrc: "/avatars/squidward.png",
    text: "Can I take your order? Please make it quick, I have a clarinet solo in 10 minutes.",
    createdAt: base - 1000 * 60 * 90,
  },
  {
    id: "seed-meme-4",
    authorName: "Mr. Krabs",
    authorHandle: "mr_krabs",
    avatarSrc: "/avatars/mrkrabs.png",
    text: "Money! Money! Money! I'm gonna count my money! Where's me money?!",
    createdAt: base - 1000 * 60 * 120,
  },
  {
    id: "seed-meme-5",
    authorName: "Sandy Cheeks",
    authorHandle: "sandy_cheeks",
    avatarSrc: "/avatars/sandy.png",
    text: "Howdy y'all! Just finished karate practice. Now let's get some ice cream! Yee-haw!",
    createdAt: base - 1000 * 60 * 180,
  },
  {
    id: "seed-meme-6",
    authorName: "Plankton",
    authorHandle: "plankton",
    avatarSrc: "/avatars/plankton.png",
    text: "The secret formula will be mine! Soon I'll have enough money to buy the Krusty Krab!",
    createdAt: base - 1000 * 60 * 240,
  },
  {
    id: "seed-meme-7",
    authorName: "Gary the Snail",
    authorHandle: "gary_snail",
    avatarSrc: "/avatars/gary.png",
    text: "Meow... Meow... Meow... (Translation: Hello SpongeBob, how was work today?)",
    createdAt: base - 1000 * 60 * 300,
  },
  {
    id: "seed-meme-8",
    authorName: "Larry the Lobster",
    authorHandle: "larry_lobster",
    avatarSrc: "/avatars/larry.png",
    text: "Dude, did you see that wave? It was totally bodacious! Let's hit the beach!",
    createdAt: base - 1000 * 60 * 360,
  },
  {
    id: "seed-meme-9",
    authorName: "Karen Plankton",
    authorHandle: "karen_plankton",
    avatarSrc: "/avatars/karen.png",
    text: "Honey, don't forget to pay attention to your wife while plotting world domination.",
    createdAt: base - 1000 * 60 * 420,
  },
];

function safeParse(raw: string | null): Tweet[] | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return null;
    return data.filter(
      (t): t is Tweet =>
        typeof t === "object" &&
        t !== null &&
        typeof (t as Tweet).id === "string" &&
        typeof (t as Tweet).text === "string" &&
        typeof (t as Tweet).createdAt === "number",
    );
  } catch {
    return null;
  }
}

export function loadTweets(): Tweet[] {
  if (typeof window === "undefined") return seedTweets;
  const parsed = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (!parsed || parsed.length === 0) return seedTweets;
  return parsed.sort((a, b) => b.createdAt - a.createdAt);
}

export function saveTweets(tweets: Tweet[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tweets));
}

export function getRandomCharacter() {
  const randomIndex = Math.floor(Math.random() * CHARACTER_AVATARS.length);
  return CHARACTER_AVATARS[randomIndex];
}

export function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * CHARACTER_QUOTES.length);
  return CHARACTER_QUOTES[randomIndex];
}

export function createTweet(text: string): Tweet {
  const character = getRandomCharacter();
  return {
    id: `tw-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text: text.trim() || getRandomQuote(),
    createdAt: Date.now(),
    authorName: character.name,
    authorHandle: character.handle,
    avatarSrc: character.avatar,
  };
}
