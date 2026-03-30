import PageHeader from "@/components/common/PageHeader";
import KpiGrid from "@/components/common/KpiGrid";
import KpiCard from "@/components/common/KpiCard";
import StatusBadge from "@/components/common/StatusBadge";
import Card from "@/components/common/Card";
import DataTable from "@/components/common/DataTable";
import FilterBar from "@/components/common/FilterBar";

const users = [
  {
    id: 1, name: "김도연", email: "doyeon.kim@dot.co.kr",
    role: "관리자" as const, department: "운영팀",
    lastAccess: "2026-03-26 14:32", status: "활성" as const, avatar: "DY",
  },
  {
    id: 2, name: "박서연", email: "seoyeon.park@dot.co.kr",
    role: "운영자" as const, department: "마케팅팀",
    lastAccess: "2026-03-26 13:15", status: "활성" as const, avatar: "SY",
  },
  {
    id: 3, name: "이정민", email: "jungmin.lee@dot.co.kr",
    role: "관리자" as const, department: "개발팀",
    lastAccess: "2026-03-26 11:48", status: "활성" as const, avatar: "JM",
  },
  {
    id: 4, name: "최현우", email: "hyunwoo.choi@dot.co.kr",
    role: "운영자" as const, department: "기획팀",
    lastAccess: "2026-03-25 17:40", status: "활성" as const, avatar: "HW",
  },
  {
    id: 5, name: "한소희", email: "sohee.han@dot.co.kr",
    role: "뷰어" as const, department: "디자인팀",
    lastAccess: "2026-03-26 10:22", status: "활성" as const, avatar: "SH",
  },
  {
    id: 6, name: "장우진", email: "woojin.jang@dot.co.kr",
    role: "운영자" as const, department: "영업팀",
    lastAccess: "2026-03-24 09:10", status: "비활성" as const, avatar: "WJ",
  },
  {
    id: 7, name: "윤서아", email: "seoa.yoon@dot.co.kr",
    role: "뷰어" as const, department: "개발팀",
    lastAccess: "2026-03-23 16:55", status: "활성" as const, avatar: "SA",
  },
  {
    id: 8, name: "강민재", email: "minjae.kang@dot.co.kr",
    role: "뷰어" as const, department: "운영팀",
    lastAccess: "2026-03-20 11:30", status: "초대됨" as const, avatar: "MJ",
  },
];

const roleBadgeVariant = {
  관리자: "error",
  운영자: "success",
  뷰어: "info",
} as const;

const statusDotClass = {
  활성: "bg-primary",
  비활성: "bg-outline-variant",
  초대됨: "bg-tertiary",
} as const;

const statusTextClass = {
  활성: "text-primary",
  비활성: "text-on-surface-variant",
  초대됨: "text-tertiary",
} as const;

const avatarStyles = [
  "bg-primary/20 text-primary",
  "bg-tertiary/20 text-tertiary",
  "bg-secondary-container text-on-secondary-container",
  "bg-error/15 text-error",
];

const columns = [
  { key: "user", label: "사용자" },
  { key: "email", label: "이메일" },
  { key: "role", label: "역할", className: "w-24" },
  { key: "department", label: "부서", className: "w-24" },
  { key: "lastAccess", label: "마지막 접속", className: "w-36" },
  { key: "status", label: "상태", className: "w-24" },
  { key: "actions", label: "", className: "w-12" },
];

export default function UsersPage() {
  const activeCount = users.filter((u) => u.status === "활성").length;
  const inactiveCount = users.filter((u) => u.status === "비활성").length;
  const invitedCount = users.filter((u) => u.status === "초대됨").length;

  const tableData = users.map((user, index) => ({
    user: (
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${avatarStyles[index % avatarStyles.length]}`}
        >
          {user.avatar}
        </div>
        <span className="text-sm font-semibold text-on-surface">{user.name}</span>
      </div>
    ),
    email: (
      <span className="text-xs text-on-surface-variant truncate">
        {user.email}
      </span>
    ),
    role: (
      <StatusBadge variant={roleBadgeVariant[user.role]}>
        {user.role}
      </StatusBadge>
    ),
    department: (
      <span className="text-xs text-on-surface">{user.department}</span>
    ),
    lastAccess: (
      <span className="text-xs text-on-surface-variant">{user.lastAccess}</span>
    ),
    status: (
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${statusDotClass[user.status]}`} />
        <span className={`text-xs font-medium ${statusTextClass[user.status]}`}>
          {user.status}
        </span>
      </div>
    ),
    actions: (
      <button className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
        <span className="material-symbols-outlined text-[18px]">more_vert</span>
      </button>
    ),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="사용자 관리"
        description="시스템 사용자를 관리하고 역할 및 권한을 설정하세요."
        breadcrumb={["관리자", "사용자"]}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-surface-container-high border border-outline-variant/15 px-4 py-2.5 rounded-xl text-on-surface-variant text-sm hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[18px]">
                download
              </span>
              내보내기
            </button>
            <button className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-dim transition-colors">
              <span className="material-symbols-outlined text-[20px]">
                person_add
              </span>
              사용자 초대
            </button>
          </div>
        }
      />

      <KpiGrid>
        <KpiCard
          icon="group"
          label="전체 사용자"
          value={String(users.length)}
        />
        <KpiCard
          icon="person"
          label="활성"
          value={String(activeCount)}
          change="온라인"
          trend="up"
        />
        <KpiCard
          icon="person_off"
          label="비활성"
          value={String(inactiveCount)}
        />
        <KpiCard
          icon="mail"
          label="초대 대기"
          value={String(invitedCount)}
          alert={invitedCount > 0}
        />
      </KpiGrid>

      <FilterBar
        searchPlaceholder="이름, 이메일, 부서로 검색..."
        tabs={[
          { label: "전체", value: "all" },
          { label: "관리자", value: "admin" },
          { label: "운영자", value: "operator" },
          { label: "뷰어", value: "viewer" },
        ]}
      />

      <Card className="p-0 overflow-hidden">
        <DataTable columns={columns} data={tableData} />
      </Card>
    </div>
  );
}
