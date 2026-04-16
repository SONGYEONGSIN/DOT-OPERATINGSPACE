"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BrandLogo, Modal } from "@/components/common";
import { signOut } from "@/features/auth/actions";
import { updateProfile, resetMyPassword } from "./account-actions";
import { IconCircleCheck } from "@tabler/icons-react";
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
  type IconProps,
} from "@tabler/icons-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

type TablerIcon = ForwardRefExoticComponent<
  IconProps & RefAttributes<SVGSVGElement>
>;

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

interface SidebarProfile {
  name: string;
  email: string;
  role: string;
  position: string | null;
  team: string;
  avatarUrl: string | null;
}

interface SidebarProps {
  profile?: SidebarProfile;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "관리자",
  operator: "운영자",
  developer: "개발자",
};

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
      {
        label: "담당자배정",
        icon: IconUserCheck,
        href: "/operations/assignments",
      },
      {
        label: "계약서 관리",
        icon: IconFileDescription,
        href: "/operations/contracts",
      },
      { label: "서비스 관리", icon: IconNetwork, href: "/operations/services" },
      {
        label: "인수인계",
        icon: IconArrowsExchange,
        href: "/operations/handover",
      },
      {
        label: "미수채권",
        icon: IconBuildingBank,
        href: "/operations/receivables",
      },
      {
        label: "대학연락처",
        icon: IconAddressBook,
        href: "/operations/contacts",
      },
      { label: "백업요청", icon: IconCloudUpload, href: "/operations/backup" },
      {
        label: "사고리포트",
        icon: IconAlertOctagon,
        href: "/operations/incidents",
      },
      { label: "기타업무", icon: IconFolders, href: "/operations/etc" },
    ],
  },
  {
    label: "프로젝트",
    href: "/projects",
    collapsible: true,
    children: [
      { label: "전체현황", icon: IconChartBar, href: "/projects" },
      { label: "PIMS", icon: IconTopologyComplex, href: "/projects/pims" },
      {
        label: "접수관리자",
        icon: IconClipboardCheck,
        href: "/projects/reception",
      },
      { label: "내부관리자", icon: IconUserShield, href: "/projects/internal" },
      { label: "경쟁률", icon: IconChartBar, href: "/projects/competition" },
      { label: "생성툴", icon: IconTool, href: "/projects/generator" },
      {
        label: "매출/분석",
        icon: IconReportAnalytics,
        href: "/projects/revenue",
      },
      { label: "정산/진학캐쉬", icon: IconCash, href: "/projects/settlement" },
      { label: "초중고", icon: IconSchool, href: "/projects/k12" },
      {
        label: "대학교육협의회",
        icon: IconBuildingArch,
        href: "/projects/kcue",
      },
      { label: "추천인검증", icon: IconUserCheck, href: "/projects/referral" },
      { label: "보증보험", icon: IconShieldCheck, href: "/projects/insurance" },
      {
        label: "실적증명",
        icon: IconCertificate,
        href: "/projects/performance",
      },
      { label: "유의사항", icon: IconAlertTriangle, href: "/projects/notices" },
    ],
  },
  {
    label: "분석 & 보고",
    href: "/analytics",
    children: [
      {
        label: "문서작성",
        icon: IconFileAnalytics,
        href: "/analytics/reports",
      },
      { label: "성과", icon: IconTrendingUp, href: "/analytics/performance" },
      { label: "업무로그", icon: IconHistory, href: "/analytics/work-logs" },
    ],
  },
  {
    label: "AI & 자동화",
    href: "/ai",
    children: [
      { label: "AI 인사이트", icon: IconBrain, href: "/ai/insights" },
      {
        label: "AI 어시스턴트",
        icon: IconMessageChatbot,
        href: "/ai/assistant",
      },
    ],
  },
  {
    label: "지원",
    href: "/support",
    children: [
      { label: "온보딩", icon: IconRocket, href: "/support/onboarding" },
      {
        label: "시스템 개선요청",
        icon: IconSettings,
        href: "/support/requests",
      },
    ],
  },
  {
    label: "관리자",
    href: "/admin",
    children: [
      { label: "사용자", icon: IconUsers, href: "/admin/users" },
      { label: "조직구성", icon: IconNetwork, href: "/admin/organization" },
      { label: "대학배정", icon: IconBuildingArch, href: "/admin/assignments" },
      { label: "시스템", icon: IconServer, href: "/admin/system" },
    ],
  },
];

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [editName, setEditName] = useState(profile?.name ?? "");
  const [editTeam, setEditTeam] = useState(profile?.team ?? "운영1팀");
  const [editPending, setEditPending] = useState(false);
  const [editResult, setEditResult] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);
  const [resetPending, setResetPending] = useState(false);
  const [resetResult, setResetResult] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);
  const accountRef = React.useRef<HTMLDivElement>(null);

  const displayName = profile?.name ?? "사용자";
  const displayEmail = profile?.email ?? "";
  const displayRole = profile
    ? (ROLE_LABELS[profile.role] ?? profile.role)
    : "";
  const avatarInitial = displayName.charAt(0);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setShowAccountMenu(false);
    }
    if (showAccountMenu)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAccountMenu]);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  function toggleCollapse(href: string) {
    setCollapsed((prev) => ({ ...prev, [href]: !prev[href] }));
  }

  return (
    <aside className="fixed top-0 left-0 z-40 h-full w-64 bg-[var(--color-surface)] flex flex-col">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="pt-4 pb-4 flex items-center justify-center px-6 shrink-0"
      >
        <BrandLogo />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {navigation
          .filter((item) => item.href !== "/admin" || profile?.role === "admin")
          .map((item, index) => {
            const isCollapsedState = collapsed[item.href] ?? false;
            const isCollapsible = item.collapsible;

            return (
              <div
                key={item.href}
                className={cn(
                  index > 0 && "mt-4 pt-3 border-t border-black/[0.04]",
                )}
              >
                {/* 대메뉴 카테고리 라벨 */}
                <div className="flex items-center justify-between px-3 mb-1.5">
                  <span className="text-[11px] font-semibold text-[var(--color-text-faint)] uppercase tracking-[0.08em]">
                    {item.label}
                  </span>
                  {isCollapsible && (
                    <button
                      onClick={() => toggleCollapse(item.href)}
                      className="p-0.5 text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] transition-colors rounded-[14px]"
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
                    isCollapsible && isCollapsedState
                      ? "max-h-0 opacity-0"
                      : "max-h-[800px] opacity-100",
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
                          "flex items-center gap-2.5 px-3 py-2 rounded-[14px] text-[13px] font-medium transition-all duration-200",
                          active
                            ? "shadow-neu-inset-soft text-[var(--color-primary)] font-semibold"
                            : "text-[var(--color-text-muted)] hover:bg-black/[0.02]",
                        )}
                      >
                        <ChildIcon
                          size={16}
                          stroke={active ? 2 : 1.5}
                          className={cn(
                            "shrink-0",
                            active
                              ? "text-[var(--color-primary)]"
                              : "text-[var(--color-text-faint)]",
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

      {/* Bottom - Account */}
      <div
        ref={accountRef}
        className="relative p-4 border-t border-black/[0.04] shrink-0"
      >
        <button
          type="button"
          onClick={() => setShowAccountMenu((prev) => !prev)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-[14px] shadow-neu-soft hover:shadow-neu-strong active:shadow-neu-inset-soft transition-shadow duration-[var(--duration-press)]"
        >
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
              <span className="text-xs font-black text-white">
                {avatarInitial}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-bold text-[var(--color-text)] truncate">
              {displayName}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] truncate">
              {displayEmail}
            </p>
          </div>
        </button>

        {showAccountMenu && (
          <div className="absolute left-4 right-4 bottom-full mb-2 bg-[var(--color-surface)] rounded-[20px] border border-black/[0.03] shadow-neu-strong overflow-hidden">
            {/* 계정 정보 */}
            <div className="px-4 py-3 border-b border-black/[0.04]">
              <p className="text-xs text-[var(--color-text-muted)] truncate">
                {displayEmail}
              </p>
              <p className="text-sm font-bold text-[var(--color-text)] mt-1">
                {profile?.position ?? displayRole}
              </p>
              {profile?.team && (
                <p className="text-xs text-[var(--color-text-muted)]">
                  {profile.team}
                </p>
              )}
            </div>
            {/* 메뉴 */}
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setShowAccountMenu(false);
                  setEditName(profile?.name ?? "");
                  setEditTeam(profile?.team ?? "운영1팀");
                  setEditResult(null);
                  setShowEditProfile(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-black/[0.02] transition-colors"
              >
                계정정보 수정
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAccountMenu(false);
                  setResetResult(null);
                  setShowPasswordReset(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-black/[0.02] transition-colors"
              >
                비밀번호 초기화
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAccountMenu(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-danger)] hover:bg-black/[0.02] transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 로그아웃 확인 모달 */}
      <Modal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        maxWidth="max-w-xs"
      >
        <div className="p-6 text-center">
          <h2 className="text-lg font-bold text-[var(--color-text)] mb-2">
            로그아웃
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            정말 로그아웃 하시겠습니까?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 py-3 border border-black/[0.06] text-[var(--color-text-muted)] font-bold rounded-[14px] text-sm hover:bg-black/[0.02] transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex-1 py-3 bg-[var(--color-surface)] shadow-neu-soft text-[var(--color-danger)] font-bold rounded-[14px] text-sm active:shadow-neu-inset-soft transition-shadow duration-[var(--duration-press)]"
            >
              로그아웃
            </button>
          </div>
        </div>
      </Modal>

      {/* 계정정보 수정 모달 */}
      <Modal
        open={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        title="계정정보 수정"
      >
        {editResult?.success ? (
          <div className="p-8 text-center">
            <IconCircleCheck
              size={48}
              className="text-[var(--color-primary)] mx-auto mb-3"
            />
            <p className="font-bold text-[var(--color-text)]">
              수정되었습니다!
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {editResult?.error && (
              <div className="p-3 rounded-[14px] shadow-neu-inset-soft border-l-4 border-[var(--color-danger)] text-[var(--color-danger)] text-xs font-medium">
                {editResult.error}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-faint)] tracking-[0.08em] uppercase mb-2">
                이름
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full shadow-neu-inset-soft bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-faint)] tracking-[0.08em] uppercase mb-2">
                팀
              </label>
              <select
                value={editTeam}
                onChange={(e) => setEditTeam(e.target.value)}
                className="w-full shadow-neu-inset-soft bg-[var(--color-surface)] border-none rounded-[14px] px-4 py-3 text-sm text-[var(--color-text)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="운영1팀">운영1팀</option>
                <option value="운영2팀">운영2팀</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-faint)] tracking-[0.08em] uppercase mb-2">
                이메일
              </label>
              <p className="px-4 py-3 text-sm text-[var(--color-text-muted)] shadow-neu-inset-soft bg-[var(--color-surface)] rounded-[14px]">
                {displayEmail}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="flex-1 py-3 border border-black/[0.06] text-[var(--color-text-muted)] font-bold rounded-[14px] text-sm hover:bg-black/[0.02] transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                disabled={editPending}
                onClick={async () => {
                  setEditPending(true);
                  const result = await updateProfile(editName, editTeam);
                  setEditResult(result);
                  setEditPending(false);
                  if (result.success) {
                    setTimeout(() => {
                      setShowEditProfile(false);
                      window.location.reload();
                    }, 1000);
                  }
                }}
                className={cn(
                  "flex-1 py-3 bg-[var(--color-surface)] shadow-neu-soft text-[var(--color-primary)] font-bold rounded-[14px] text-sm active:shadow-neu-inset-soft transition-shadow duration-[var(--duration-press)]",
                  editPending && "opacity-60",
                )}
              >
                {editPending ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 비밀번호 초기화 모달 */}
      <Modal
        open={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
      >
        <div className="p-6 text-center">
          {resetResult?.success ? (
            <>
              <IconCircleCheck
                size={48}
                className="text-[var(--color-primary)] mx-auto mb-3"
              />
              <h2 className="text-lg font-bold text-[var(--color-text)] mb-2">
                메일 발송 완료
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                <span className="font-bold text-[var(--color-text)]">
                  {displayEmail}
                </span>
                으로
                <br />
                비밀번호 초기화 링크를 발송했습니다.
              </p>
              <button
                type="button"
                onClick={() => setShowPasswordReset(false)}
                className="w-full py-3 bg-[var(--color-surface)] shadow-neu-soft text-[var(--color-primary)] font-bold rounded-[14px] text-sm active:shadow-neu-inset-soft transition-shadow duration-[var(--duration-press)]"
              >
                확인
              </button>
            </>
          ) : resetResult?.error ? (
            <>
              <h2 className="text-lg font-bold text-[var(--color-text)] mb-2">
                오류
              </h2>
              <p className="text-sm text-[var(--color-danger)] mb-6">
                {resetResult.error}
              </p>
              <button
                type="button"
                onClick={() => setShowPasswordReset(false)}
                className="w-full py-3 border border-black/[0.06] text-[var(--color-text-muted)] font-bold rounded-[14px] text-sm hover:bg-black/[0.02] transition-colors"
              >
                닫기
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-[var(--color-text)] mb-2">
                비밀번호 초기화
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">
                <span className="font-bold text-[var(--color-text)]">
                  {displayEmail}
                </span>
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                위 이메일로 비밀번호 초기화 링크를 발송합니다.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(false)}
                  className="flex-1 py-3 border border-black/[0.06] text-[var(--color-text-muted)] font-bold rounded-[14px] text-sm hover:bg-black/[0.02] transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={resetPending}
                  onClick={async () => {
                    setResetPending(true);
                    const result = await resetMyPassword();
                    setResetResult(result);
                    setResetPending(false);
                  }}
                  className={cn(
                    "flex-1 py-3 bg-[var(--color-surface)] shadow-neu-soft text-[var(--color-primary)] font-bold rounded-[14px] text-sm active:shadow-neu-inset-soft transition-shadow duration-[var(--duration-press)]",
                    resetPending && "opacity-60",
                  )}
                >
                  {resetPending ? "발송 중..." : "발송"}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </aside>
  );
}
