"use client";

import { useMemo } from "react";

type AvatarProps = {
  name: string;
  handle: string;
  size?: number;
  className?: string;
};

const COLORS = [
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#3b82f6",
  "#14b8a6",
  "#6366f1",
  "#84cc16",
  "#f43f5e",
  "#0ea5e9",
  "#a855f7",
  "#22c55e",
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function Avatar({ name, handle, size = 40, className = "" }: AvatarProps) {
  const initials = useMemo(() => {
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  const color = useMemo(() => COLORS[hashStr(handle) % COLORS.length], [handle]);

  const svgData = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${size / 2}" fill="${color}"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="${size * 0.4}" font-weight="700" fill="white">${initials}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }, [initials, color, size]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={svgData}
      alt={name}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
    />
  );
}
