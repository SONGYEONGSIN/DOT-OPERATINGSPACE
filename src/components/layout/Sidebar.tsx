"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

interface NavItem {
  label: string;
  icon: string;
  href: string;
  children?: { label: string; href: string }[];
}

const navigation: NavItem[] = [
  { label: "대시보드", icon: "dashboard", href: "/dashboard" },
  {
    label: "운영",
    icon: "business_center",
    href: "/operations",
    children: [
      { label: "계약서", href: "/operations/contracts" },
      { label: "서비스", href: "/operations/services" },
      { label: "인수인계", href: "/operations/handover" },
      { label: "미수채권", href: "/operations/receivables" },
      { label: "대학연락처", href: "/operations/contacts" },
    ],
  },
  {
    label: "프로젝트",
    icon: "folder_special",
    href: "/projects",
    children: [
      { label: "PIMS", href: "/projects/pims" },
      { label: "접수관리자", href: "/projects/reception" },
      { label: "내부관리자", href: "/projects/internal" },
      { label: "경쟁률", href: "/projects/competition" },
      { label: "생성툴", href: "/projects/generator" },
      { label: "매출/분석", href: "/projects/revenue" },
      { label: "정산/진학캐쉬", href: "/projects/settlement" },
      { label: "초중고", href: "/projects/k12" },
      { label: "한국대학교육협의회", href: "/projects/kcue" },
      { label: "추천인검증", href: "/projects/referral" },
      { label: "보증보험", href: "/projects/insurance" },
      { label: "실적증명", href: "/projects/performance" },
      { label: "유의사항", href: "/projects/notices" },
    ],
  },
  {
    label: "분석 & 보고",
    icon: "monitoring",
    href: "/analytics",
    children: [
      { label: "보고서", href: "/analytics/reports" },
      { label: "성과", href: "/analytics/performance" },
      { label: "업무로그", href: "/analytics/work-logs" },
    ],
  },
  {
    label: "AI & 자동화",
    icon: "smart_toy",
    href: "/ai",
    children: [
      { label: "AI 인사이트", href: "/ai/insights" },
      { label: "AI 어시스턴트", href: "/ai/assistant" },
    ],
  },
  {
    label: "지원",
    icon: "support_agent",
    href: "/support",
    children: [
      { label: "온보딩", href: "/support/onboarding" },
      { label: "시스템 개선요청", href: "/support/requests" },
    ],
  },
  {
    label: "관리자",
    icon: "admin_panel_settings",
    href: "/admin",
    children: [
      { label: "사용자", href: "/admin/users" },
      { label: "시스템", href: "/admin/system" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  function toggleExpand(href: string) {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href],
    );
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="fixed top-0 left-0 z-40 h-full w-64 bg-surface-container-low flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-6 shrink-0">
        <span className="material-symbols-outlined text-primary text-3xl">
          hexagons
        </span>
        <span className="text-xl font-black tracking-tighter text-on-surface uppercase">
          SentinelHub
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          const expanded = expandedItems.includes(item.href);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.href}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-surface-container-high text-primary"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                  )}
                >
                  <span className="material-symbols-outlined text-xl">
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  <span
                    className={cn(
                      "material-symbols-outlined text-base transition-transform duration-200",
                      expanded && "rotate-180",
                    )}
                  >
                    expand_more
                  </span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-surface-container-high text-primary border-l-2 border-primary"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                  )}
                >
                  <span className="material-symbols-outlined text-xl">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              )}

              {/* Sub Navigation */}
              {hasChildren && (
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                  )}
                >
                  <div className="ml-8 mt-1 space-y-0.5 border-l border-outline-variant/20 pl-3">
                    {item.children?.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-3 py-2 rounded-md text-xs font-medium transition-all duration-200",
                          isActive(child.href)
                            ? "text-primary bg-surface-container-high"
                            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-outline-variant/10 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
            <span className="text-xs font-black text-on-primary-container">
              A
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-on-surface truncate">
              Admin User
            </p>
            <p className="text-[10px] text-on-surface-variant truncate">
              Supervisor
            </p>
          </div>
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
