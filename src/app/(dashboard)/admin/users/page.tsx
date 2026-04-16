import { Suspense } from "react";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/server";
import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  DataTable,
  TableSection,
  UserAvatar,
  FilterBar,
} from "@/components/common";
import { IconUsers, IconShieldCog, IconUsersGroup } from "@tabler/icons-react";
import UserActionMenu from "./UserActionMenu";
import InviteButton from "./InviteButton";

type TeamFilter = "all" | "운영1팀" | "운영2팀";

interface Profile {
  id: number;
  email: string;
  name: string;
  role: "admin" | "operator";
  position: string | null;
  team: "운영1팀" | "운영2팀";
  avatar_url: string | null;
  status: "active" | "inactive";
  last_sign_in: string | null;
  created_at: string;
  updated_at: string;
}

interface UsersPageProps {
  searchParams: Promise<{ tab?: string; search?: string }>;
}

function formatLastSignIn(date: string | null): string {
  if (!date) return "접속 기록 없음";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return new Date(date).toLocaleDateString("ko-KR");
}

const teamTabs: { label: string; value: TeamFilter }[] = [
  { label: "전체", value: "all" },
  { label: "운영1팀", value: "운영1팀" },
  { label: "운영2팀", value: "운영2팀" },
];

const columns = [
  { key: "name", label: "이름" },
  { key: "email", label: "이메일" },
  { key: "position", label: "직급", className: "w-20" },
  { key: "role", label: "역할", className: "w-24" },
  { key: "team", label: "팀", className: "w-24" },
  { key: "status", label: "상태", className: "w-24" },
  { key: "lastSignIn", label: "마지막 접속", className: "w-36" },
  { key: "actions", label: "", className: "w-12" },
];

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const activeTeam = (params.tab ?? "all") as TeamFilter;
  const searchQuery = (params.search ?? "").toLowerCase();

  const supabase = createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const allProfiles: Profile[] = profiles ?? [];

  const totalCount = allProfiles.length;
  const adminCount = allProfiles.filter((p) => p.role === "admin").length;
  const team1Count = allProfiles.filter((p) => p.team === "운영1팀").length;
  const team2Count = allProfiles.filter((p) => p.team === "운영2팀").length;

  let filteredProfiles =
    activeTeam === "all"
      ? allProfiles
      : allProfiles.filter((p) => p.team === activeTeam);

  if (searchQuery) {
    filteredProfiles = filteredProfiles.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery) ||
        p.email.toLowerCase().includes(searchQuery),
    );
  }

  const tableData = filteredProfiles.map((profile) => ({
    name: (
      <div className="flex items-center gap-3">
        <UserAvatar name={profile.name} size="sm" />
        <span className="text-sm font-semibold text-[var(--color-text)]">
          {profile.name}
        </span>
      </div>
    ),
    email: (
      <span className="text-xs text-[var(--color-text-muted)]">{profile.email}</span>
    ),
    position: (
      <span className={`text-xs font-bold ${profile.position === "부장" ? "text-primary" : profile.position === "팀장" ? "text-tertiary" : "text-[var(--color-text-muted)]"}`}>
        {profile.position ?? "매니저"}
      </span>
    ),
    role: (
      <StatusBadge variant={profile.role === "admin" ? "error" : "success"}>
        {profile.role === "admin" ? "관리자" : "운영자"}
      </StatusBadge>
    ),
    team: (
      <span className="text-xs text-[var(--color-text)]">{profile.team}</span>
    ),
    status: (
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            profile.status === "active"
              ? "bg-primary"
              : "bg-outline-variant",
          )}
        />
        <span
          className={cn(
            "text-xs font-medium",
            profile.status === "active"
              ? "text-primary"
              : "text-[var(--color-text-muted)]",
          )}
        >
          {profile.status === "active" ? "활성" : "비활성"}
        </span>
      </div>
    ),
    lastSignIn: (
      <span className="text-xs text-[var(--color-text-muted)]">
        {formatLastSignIn(profile.last_sign_in)}
      </span>
    ),
    actions: (
      <UserActionMenu
        userId={profile.id}
        userName={profile.name}
        status={profile.status}
      />
    ),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="사용자 관리"
        breadcrumb={["관리자", "사용자"]}
        actions={<InviteButton />}
      />

      <KpiGrid>
        <KpiCard
          icon={<IconUsers size={18} className="text-[var(--color-text-muted)]" />}
          label="전체 사용자"
          value={String(totalCount)}
          suffix="명"
        />
        <KpiCard
          icon={<IconShieldCog size={18} className="text-[var(--color-text-muted)]" />}
          label="관리자"
          value={String(adminCount)}
          suffix="명"
        />
        <KpiCard
          icon={<IconUsersGroup size={18} className="text-[var(--color-text-muted)]" />}
          label="운영1팀"
          value={String(team1Count)}
          suffix="명"
        />
        <KpiCard
          icon={<IconUsersGroup size={18} className="text-[var(--color-text-muted)]" />}
          label="운영2팀"
          value={String(team2Count)}
          suffix="명"
        />
      </KpiGrid>

      <Suspense>
        <FilterBar
          searchPlaceholder="이름 또는 이메일 검색..."
          tabs={teamTabs}
        />
      </Suspense>

      <TableSection totalCount={filteredProfiles.length}>
        <DataTable columns={columns} data={tableData} />
      </TableSection>
    </div>
  );
}
