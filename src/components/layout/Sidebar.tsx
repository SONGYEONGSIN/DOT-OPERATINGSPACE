"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BrandLogo } from "@/components/common";

interface NavChild {
  label: string;
  icon?: string;
  href: string;
}

interface NavItem {
  label: string;
  icon: string;
  href: string;
  collapsible?: boolean;
  children?: NavChild[];
}

const navigation: NavItem[] = [
  {
    label: "메인",
    icon: "space_dashboard",
    href: "/dashboard",
    children: [
      { label: "대시보드", icon: "dashboard", href: "/dashboard" },
      { label: "브리핑", icon: "campaign", href: "/dashboard/briefing" },
      { label: "전체일정", icon: "calendar_month", href: "/dashboard/schedule" },
    ],
  },
  {
    label: "운영",
    icon: "business_center",
    href: "/operations",
    collapsible: true,
    children: [
      { label: "계약서", icon: "description", href: "/operations/contracts" },
      { label: "서비스", icon: "lan", href: "/operations/services" },
      { label: "인수인계", icon: "swap_horiz", href: "/operations/handover" },
      { label: "미수채권", icon: "account_balance", href: "/operations/receivables" },
      { label: "대학연락처", icon: "contacts", href: "/operations/contacts" },
    ],
  },
  {
    label: "프로젝트",
    icon: "folder_special",
    href: "/projects",
    collapsible: true,
    children: [
      { label: "PIMS", icon: "hub", href: "/projects/pims" },
      { label: "접수관리자", icon: "assignment", href: "/projects/reception" },
      { label: "내부관리자", icon: "admin_panel_settings", href: "/projects/internal" },
      { label: "경쟁률", icon: "leaderboard", href: "/projects/competition" },
      { label: "생성툴", icon: "construction", href: "/projects/generator" },
      { label: "매출/분석", icon: "analytics", href: "/projects/revenue" },
      { label: "정산/진학캐쉬", icon: "payments", href: "/projects/settlement" },
      { label: "초중고", icon: "school", href: "/projects/k12" },
      { label: "대학교육협의회", icon: "account_balance", href: "/projects/kcue" },
      { label: "추천인검증", icon: "verified_user", href: "/projects/referral" },
      { label: "보증보험", icon: "shield", href: "/projects/insurance" },
      { label: "실적증명", icon: "workspace_premium", href: "/projects/performance" },
      { label: "유의사항", icon: "warning", href: "/projects/notices" },
    ],
  },
  {
    label: "분석 & 보고",
    icon: "monitoring",
    href: "/analytics",
    children: [
      { label: "보고서", icon: "summarize", href: "/analytics/reports" },
      { label: "성과", icon: "trending_up", href: "/analytics/performance" },
      { label: "업무로그", icon: "history", href: "/analytics/work-logs" },
    ],
  },
  {
    label: "AI & 자동화",
    icon: "smart_toy",
    href: "/ai",
    children: [
      { label: "AI 인사이트", icon: "psychology", href: "/ai/insights" },
      { label: "AI 어시스턴트", icon: "assistant", href: "/ai/assistant" },
    ],
  },
  {
    label: "지원",
    icon: "support_agent",
    href: "/support",
    children: [
      { label: "온보딩", icon: "rocket_launch", href: "/support/onboarding" },
      { label: "시스템 개선요청", icon: "build", href: "/support/requests" },
    ],
  },
  {
    label: "관리자",
    icon: "admin_panel_settings",
    href: "/admin",
    children: [
      { label: "사용자", icon: "group", href: "/admin/users" },
      { label: "시스템", icon: "settings", href: "/admin/system" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function toggleCollapse(href: string) {
    setCollapsed((prev) => ({ ...prev, [href]: !prev[href] }));
  }

  return (
    <aside className="fixed top-0 left-0 z-40 h-full w-64 bg-surface-container-low flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 shrink-0">
        <BrandLogo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navigation.map((item, index) => {
          const isCollapsed = collapsed[item.href] ?? false;
          const isCollapsible = item.collapsible;

          return (
            <div
              key={item.href}
              className={cn(index > 0 && "mt-4 pt-3 border-t border-outline-variant/10")}
            >
              {/* 대메뉴 카테고리 라벨 */}
              <div className="flex items-center justify-between px-3 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline-variant text-[14px]">
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-bold text-outline-variant uppercase tracking-[0.15em]">
                    {item.label}
                  </span>
                </div>
                {isCollapsible && (
                  <button
                    onClick={() => toggleCollapse(item.href)}
                    className="p-0.5 text-outline-variant hover:text-on-surface-variant transition-colors rounded"
                  >
                    <span
                      className={cn(
                        "material-symbols-outlined text-[14px] transition-transform duration-200",
                        isCollapsed && "-rotate-90",
                      )}
                    >
                      expand_more
                    </span>
                  </button>
                )}
              </div>

              {/* 소메뉴 */}
              <div
                className={cn(
                  "space-y-0.5 overflow-hidden transition-all duration-200",
                  isCollapsible && isCollapsed ? "max-h-0 opacity-0" : "max-h-[800px] opacity-100",
                )}
              >
                {item.children?.map((child) => {
                  const active = isActive(child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                        active
                          ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                      )}
                    >
                      <span
                        className={cn(
                          "material-symbols-outlined text-base",
                          active ? "text-primary" : "text-outline",
                        )}
                      >
                        {child.icon}
                      </span>
                      <span>{child.label}</span>
                    </Link>
                  );
                })}
              </div>
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
