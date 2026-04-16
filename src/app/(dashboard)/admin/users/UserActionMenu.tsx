"use client";

import { useRef, useState, useEffect } from "react";
import { IconDotsVertical, IconUser, IconArrowsExchange, IconUserOff, IconLockOpen } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

interface UserActionMenuProps {
  userId: number;
  userName: string;
  status: string;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export default function UserActionMenu({
  userId,
  userName,
  status,
}: UserActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const menuItems: MenuItem[] = [
    {
      icon: <IconUser size={18} className="text-[var(--color-text-muted)]" />,
      label: "프로필 보기",
      onClick: () => setIsOpen(false),
    },
    {
      icon: <IconArrowsExchange size={18} className="text-[var(--color-text-muted)]" />,
      label: "역할 변경",
      onClick: () => setIsOpen(false),
    },
    {
      icon: status === "active" ? <IconUserOff size={18} className="text-[var(--color-text-muted)]" /> : <IconUser size={18} className="text-[var(--color-text-muted)]" />,
      label: status === "active" ? "비활성화" : "활성화",
      onClick: () => setIsOpen(false),
    },
    {
      icon: <IconLockOpen size={18} className="text-[var(--color-text-muted)]" />,
      label: "비밀번호 초기화",
      onClick: () => setIsOpen(false),
    },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-8 h-8 rounded-[14px] flex items-center justify-center",
          "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
          "hover:bg-[var(--color-surface)] transition-colors",
        )}
        aria-label={`${userName} 관리 메뉴`}
      >
        <IconDotsVertical size={16} />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full mt-1 z-10",
            "min-w-[160px]",
            "bg-[var(--color-surface)] rounded-[14px]",
            "border border-black/[0.04]/15 shadow-neu-strong",
          )}
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              data-user-id={userId}
              onClick={item.onClick}
              className={cn(
                "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm",
                "text-[var(--color-text)] hover:bg-surface-bright transition-colors",
                "first:rounded-t-lg last:rounded-b-lg",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
