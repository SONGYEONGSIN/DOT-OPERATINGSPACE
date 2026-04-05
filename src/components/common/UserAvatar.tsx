import { cn } from "@/lib/cn";

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
} as const;

export default function UserAvatar({
  name,
  size = "md",
  className,
}: UserAvatarProps) {
  const avatarUrl = `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(name)}`;

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden flex-shrink-0",
        sizeStyles[size],
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarUrl}
        alt={`${name} 아바타`}
        width={48}
        height={48}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
