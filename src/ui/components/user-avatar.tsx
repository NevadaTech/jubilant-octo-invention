"use client";

import Avatar from "boring-avatars";

interface UserAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

const AVATAR_COLORS = [
  "#0ea5e9", // sky-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
];

export function UserAvatar({ name, size = 40, className }: UserAvatarProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Avatar size={size} name={name} variant="marble" colors={AVATAR_COLORS} />
    </div>
  );
}
