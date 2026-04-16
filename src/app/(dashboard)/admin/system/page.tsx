import { createClient } from "@/lib/supabase/server";
import {
  PageHeader,
  KpiGrid,
  KpiCard,
  StatusBadge,
  Card,
  DataTable,
  TableSection,
} from "@/components/common";
import {
  IconServer,
  IconDatabase,
  IconUsers,
  IconActivity,
  IconMail,
  IconCloud,
  IconBrandAzure,
  IconLink,
  IconCircleCheck,
} from "@tabler/icons-react";
import { PROJECT_NAMES } from "../../projects/_components/types";

export default async function SystemPage() {
  const supabase = createClient();

  const [
    { count: serviceCount },
    { count: taskCount },
    { count: logCount },
    { count: profileCount },
    { count: contactCount },
    { count: handoverCount },
    { count: backupCount },
    { count: workLogCount },
    { data: recentLogs },
    { data: profiles },
  ] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("project_tasks").select("id", { count: "exact", head: true }),
    supabase.from("project_logs").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("university_contacts").select("id", { count: "exact", head: true }),
    supabase.from("handover_logs").select("id", { count: "exact", head: true }),
    supabase.from("backup_requests").select("id", { count: "exact", head: true }),
    supabase.from("service_work_logs").select("service_id", { count: "exact", head: true }),
    supabase.from("project_logs").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("profiles").select("name, team, status, role").order("name"),
  ]);

  const allProfiles = (profiles ?? []) as { name: string; team: string; status: string; role: string }[];
  const allLogs = (recentLogs ?? []) as { id: number; project: string; action: string; actor: string; detail: string | null; created_at: string }[];

  const dbTables = [
    { name: "services", label: "서비스 관리", count: serviceCount ?? 0 },
    { name: "service_work_logs", label: "서비스 작업이력", count: workLogCount ?? 0 },
    { name: "project_tasks", label: "프로젝트 작업", count: taskCount ?? 0 },
    { name: "project_logs", label: "프로젝트 활동로그", count: logCount ?? 0 },
    { name: "profiles", label: "사용자 프로필", count: profileCount ?? 0 },
    { name: "university_contacts", label: "대학 연락처", count: contactCount ?? 0 },
    { name: "handover_logs", label: "인수인계 이력", count: handoverCount ?? 0 },
    { name: "backup_requests", label: "백업 요청", count: backupCount ?? 0 },
  ];

  const totalRecords = dbTables.reduce((sum, t) => sum + t.count, 0);
  const activeUsers = allProfiles.filter((p) => p.status === "active").length;

  // 외부 연동 현황
  const integrations = [
    {
      name: "Supabase",
      description: "데이터베이스 및 인증 (PostgreSQL)",
      icon: <IconDatabase size={18} />,
      status: "connected" as const,
      details: `${dbTables.length}개 테이블 · ${totalRecords.toLocaleString()}건`,
      tables: ["services", "profiles", "project_tasks", "project_logs", "university_contacts", "handover_logs", "backup_requests", "service_work_logs", "schedules"],
    },
    {
      name: "SharePoint (미수채권)",
      description: "Microsoft Graph API로 미수채권 엑셀 파일 읽기/쓰기",
      icon: <IconBrandAzure size={18} />,
      status: "connected" as const,
      details: "미수채권 관리 → Excel 연동",
      env: "SHAREPOINT_RECEIVABLES_DRIVE_ID, SHAREPOINT_RECEIVABLES_ITEM_ID",
    },
    {
      name: "SharePoint (계약서)",
      description: "Microsoft Graph API로 계약서 관리대장 엑셀 읽기",
      icon: <IconBrandAzure size={18} />,
      status: "connected" as const,
      details: "계약서 관리 → Excel 연동 (4년제/전문대/초중고/대학원/기타)",
      env: "SHAREPOINT_CONTRACTS_DRIVE_ID, SHAREPOINT_CONTRACTS_ITEM_ID",
    },
    {
      name: "Azure AD",
      description: "Microsoft Graph API 인증 (Client Credentials Flow)",
      icon: <IconCloud size={18} />,
      status: "connected" as const,
      details: "SharePoint 파일 접근용 OAuth 2.0 토큰 발급",
      env: "AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, AZURE_AD_TENANT_ID",
    },
    {
      name: "Gmail SMTP",
      description: "nodemailer를 통한 이메일 발송",
      icon: <IconMail size={18} />,
      status: "connected" as const,
      details: `발송계정: ${process.env.GMAIL_USER ?? "-"}`,
      env: "GMAIL_USER, GMAIL_APP_PASSWORD",
    },
  ];

  // 자동 메일 발송 현황
  const mailFeatures = [
    {
      trigger: "인수인계 실행",
      recipient: "인수자 (TO) / 같은팀 (CC) / 다른팀 (BCC)",
      content: "인수인계 내역 HTML 리포트",
      module: "운영 > 인수인계",
    },
    {
      trigger: "백업요청 작성 완료",
      recipient: "백업자 (TO) / 같은팀 다른 팀원 (CC) / 고객센터 (BCC)",
      content: "백업 요청 상세 (기간, 백업 항목, 담당자)",
      module: "운영 > 백업요청",
    },
    {
      trigger: "독촉메일 발송",
      recipient: "학교담당자 이메일 (TO)",
      content: "미수금 입금 안내 (거래처, 청구금액, 경과일)",
      module: "운영 > 미수채권",
    },
  ];

  const userColumns = [
    { key: "name", label: "이름" },
    { key: "team", label: "팀" },
    { key: "role", label: "역할" },
    { key: "status", label: "상태" },
  ];

  const userData = allProfiles.map((p) => ({
    name: <span className="text-sm font-medium text-[var(--color-text)]">{p.name}</span>,
    team: <span className="text-xs text-[var(--color-text-muted)]">{p.team}</span>,
    role: <StatusBadge variant={p.role === "admin" ? "warning" : "neutral"}>{p.role === "admin" ? "관리자" : "운영자"}</StatusBadge>,
    status: <StatusBadge variant={p.status === "active" ? "success" : "error"}>{p.status === "active" ? "활성" : "비활성"}</StatusBadge>,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="시스템 관리"
        description="시스템 연동 현황, 메일 발송 설정, 데이터베이스 상태를 확인합니다."
        breadcrumb={["관리자", "시스템"]}
        actions={
          <Card className="flex items-center gap-2 px-3 py-2 !border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary">시스템 정상</span>
          </Card>
        }
      />

      <KpiGrid>
        <KpiCard
          icon={<IconDatabase size={18} className="text-[var(--color-text-muted)]" />}
          label="전체 레코드"
          value={totalRecords.toLocaleString()}
          suffix="건"
          change={`${dbTables.length}개 테이블`}
        />
        <KpiCard
          icon={<IconUsers size={18} className="text-[var(--color-text-muted)]" />}
          label="등록 사용자"
          value={(profileCount ?? 0).toString()}
          suffix="명"
          change={`활성 ${activeUsers}명`}
        />
        <KpiCard
          icon={<IconLink size={18} className="text-[var(--color-text-muted)]" />}
          label="외부 연동"
          value={integrations.length.toString()}
          suffix="개"
          change="전체 정상"
          trend="up"
        />
        <KpiCard
          icon={<IconMail size={18} className="text-[var(--color-text-muted)]" />}
          label="메일 발송 기능"
          value={mailFeatures.length.toString()}
          suffix="개"
        />
      </KpiGrid>

      {/* 외부 연동 현황 */}
      <div>
        <h3 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">외부 시스템 연동</h3>
        <div className="space-y-3">
          {integrations.map((item) => (
            <Card key={item.name} className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-[var(--color-text)]">{item.name}</h4>
                    <StatusBadge variant="success">
                      <span className="flex items-center gap-1"><IconCircleCheck size={10} /> 연결됨</span>
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">{item.description}</p>
                  <p className="text-xs text-[var(--color-text)] mt-1">{item.details}</p>
                  {"env" in item && (
                    <p className="text-[10px] font-mono text-[var(--color-text-muted)]/60 mt-1">{item.env}</p>
                  )}
                  {"tables" in item && item.tables && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tables.map((t: string) => (
                        <span key={t} className="text-[9px] font-mono bg-[var(--color-surface)] rounded px-1.5 py-0.5 text-[var(--color-text-muted)]">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 자동 메일 발송 설정 */}
      <div>
        <h3 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">자동 메일 발송</h3>
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--color-surface)]/50">
                <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-3">트리거</th>
                <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-3">수신 대상</th>
                <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-3">메일 내용</th>
                <th className="text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-5 py-3 w-[140px]">모듈</th>
              </tr>
            </thead>
            <tbody>
              {mailFeatures.map((mail) => (
                <tr key={mail.trigger} className="border-t border-black/[0.04]/5">
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold text-[var(--color-text)]">{mail.trigger}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-[var(--color-text-muted)]">{mail.recipient}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-[var(--color-text-muted)]">{mail.content}</span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge variant="info">{mail.module}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DB 테이블 현황 */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-5">데이터베이스 테이블</h3>
            <div className="space-y-3">
              {dbTables.map((table) => (
                <div key={table.name} className="flex items-center justify-between p-3 rounded-[14px] bg-[var(--color-surface)]/50">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{table.label}</p>
                    <p className="text-[10px] font-mono text-[var(--color-text-muted)]">{table.name}</p>
                  </div>
                  <span className="text-sm font-black text-[var(--color-text)] tabular-nums">{table.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 최근 시스템 활동 */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-5">최근 활동</h3>
          <div className="space-y-3">
            {allLogs.length > 0 ? (
              allLogs.map((log) => (
                <div key={log.id} className="flex gap-3 p-3 rounded-[14px] hover:bg-[var(--color-surface)]/50 transition-colors">
                  <div className="w-8 h-8 rounded-[14px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <IconActivity size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--color-text)] leading-snug">{log.detail ?? log.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[var(--color-text-muted)]">{log.actor}</span>
                      <span className="text-[10px] text-primary font-bold">{PROJECT_NAMES[log.project] ?? log.project}</span>
                    </div>
                    <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">
                      {new Date(log.created_at).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--color-text-muted)] text-center py-6">활동 기록이 없습니다.</p>
            )}
          </div>
        </Card>
      </div>

      {/* 사용자 목록 */}
      <div>
        <h3 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">등록 사용자</h3>
        <TableSection totalCount={allProfiles.length}>
          <DataTable columns={userColumns} data={userData} />
        </TableSection>
      </div>
    </div>
  );
}
