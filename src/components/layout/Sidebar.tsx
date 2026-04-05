"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BrandLogo } from "@/components/common";
import { signOut } from "@/features/auth/actions";
import {
  IconLayoutDashboard,
  IconSpeakerphone,
  IconCalendar,
  IconFileDescription,
  IconNetwork,
  IconArrowsExchange,
  IconBuildingBank,
  IconAddressBook,
  IconCloudUpload,
  IconTopologyComplex,
  IconClipboardCheck,
  IconUserShield,
  IconChartBar,
  IconTool,
  IconReportAnalytics,
  IconCash,
  IconSchool,
  IconBuildingArch,
  IconUserCheck,
  IconShieldCheck,
  IconCertificate,
  IconAlertTriangle,
  IconAlertOctagon,
  IconFolders,
  IconFileAnalytics,
  IconTrendingUp,
  IconHistory,
  IconBrain,
  IconMessageChatbot,
  IconRocket,
  IconSettings,
  IconUsers,
  IconServer,
  IconChevronDown,
  IconLogout,
  type IconProps,
} from "@tabler/icons-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

type TablerIcon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

interface NavChild {
  label: string;
  icon: TablerIcon;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  collapsible?: boolean;
  children: NavChild[];
}

const navigation: NavItem[] = [
  {
    label: "메인",
    href: "/dashboard",
    collapsible: true,
    children: [
      { label: "대시보드", icon: IconLayoutDashboard, href: "/dashboard" },
      { label: "브리핑", icon: IconSpeakerphone, href: "/dashboard/briefing" },
      { label: "전체일정", icon: IconCalendar, href: "/dashboard/schedule" },
    ],
  },
  {
    label: "운영",
    href: "/operations",
    collapsible: true,
    children: [
      { label: "계약서 관리", icon: IconFileDescription, href: "/operations/contracts" },
      { label: "서비스 관리", icon: IconNetwork, href: "/operations/services" },
      { label: "인수인계", icon: IconArrowsExchange, href: "/operations/handover" },
      { label: "미수채권", icon: IconBuildingBank, href: "/operations/receivables" },
      { label: "대학연락처", icon: IconAddressBook, href: "/operations/contacts" },
      { label: "백업요청", icon: IconCloudUpload, href: "/operations/backup" },
      { label: "사고리포트", icon: IconAlertOctagon, href: "/operations/incidents" },
      { label: "기타", icon: IconFolders, href: "/operations/etc" },
    ],
  },
  {
    label: "프로젝트",
    href: "/projects",
    collapsible: true,
    children: [
      { label: "PIMS", icon: IconTopologyComplex, href: "/projects/pims" },
      { label: "접수관리자", icon: IconClipboardCheck, href: "/projects/reception" },
      { label: "내부관리자", icon: IconUserShield, href: "/projects/internal" },
      { label: "경쟁률", icon: IconChartBar, href: "/projects/competition" },
      { label: "생성툴", icon: IconTool, href: "/projects/generator" },
      { label: "매출/분석", icon: IconReportAnalytics, href: "/projects/revenue" },
      { label: "정산/진학캐쉬", icon: IconCash, href: "/projects/settlement" },
      { label: "초중고", icon: IconSchool, href: "/projects/k12" },
      { label: "대학교육협의회", icon: IconBuildingArch, href: "/projects/kcue" },
      { label: "추천인검증", icon: IconUserCheck, href: "/projects/referral" },
      { label: "보증보험", icon: IconShieldCheck, href: "/projects/insurance" },
      { label: "실적증명", icon: IconCertificate, href: "/projects/performance" },
      { label: "유의사항", icon: IconAlertTriangle, href: "/projects/notices" },
    ],
  },
  {
    label: "분석 & 보고",
    href: "/analytics",
    children: [
      { label: "보고서", icon: IconFileAnalytics, href: "/analytics/reports" },
      { label: "성과", icon: IconTrendingUp, href: "/analytics/performance" },
      { label: "업무로그", icon: IconHistory, href: "/analytics/work-logs" },
    ],
  },
  {
    label: "AI & 자동화",
    href: "/ai",
    children: [
      { label: "AI 인사이트", icon: IconBrain, href: "/ai/insights" },
      { label: "AI 어시스턴트", icon: IconMessageChatbot, href: "/ai/assistant" },
    ],
  },
  {
    label: "지원",
    href: "/support",
    children: [
      { label: "온보딩", icon: IconRocket, href: "/support/onboarding" },
      { label: "시스템 개선요청", icon: IconSettings, href: "/support/requests" },
    ],
  },
  {
    label: "관리자",
    href: "/admin",
    children: [
      { label: "사용자", icon: IconUsers, href: "/admin/users" },
      { label: "대학배정", icon: IconBuildingArch, href: "/admin/assignments" },
      { label: "시스템", icon: IconServer, href: "/admin/system" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
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
          const isCollapsedState = collapsed[item.href] ?? false;
          const isCollapsible = item.collapsible;

          return (
            <div
              key={item.href}
              className={cn(index > 0 && "mt-4 pt-3 border-t border-outline-variant/10")}
            >
              {/* 대메뉴 카테고리 라벨 */}
              <div className="flex items-center justify-between px-3 mb-1.5">
                <span className="text-[10px] font-bold text-outline-variant uppercase tracking-[0.15em]">
                  {item.label}
                </span>
                {isCollapsible && (
                  <button
                    onClick={() => toggleCollapse(item.href)}
                    className="p-0.5 text-outline-variant hover:text-on-surface-variant transition-colors rounded"
                  >
                    <IconChevronDown
                      size={14}
                      className={cn(
                        "transition-transform duration-200",
                        isCollapsedState && "-rotate-90",
                      )}
                    />
                  </button>
                )}
              </div>

              {/* 소메뉴 */}
              <div
                className={cn(
                  "space-y-0.5 overflow-hidden transition-all duration-200",
                  isCollapsible && isCollapsedState ? "max-h-0 opacity-0" : "max-h-[800px] opacity-100",
                )}
              >
                {item.children.map((child) => {
                  const active = isActive(child.href);
                  const ChildIcon = child.icon;
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
                      <ChildIcon
                        size={16}
                        stroke={active ? 2 : 1.5}
                        className={cn(
                          "shrink-0",
                          active ? "text-primary" : "text-outline",
                        )}
                      />
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
          <button
            onClick={() => signOut()}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <IconLogout size={18} stroke={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
