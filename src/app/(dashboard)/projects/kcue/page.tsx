import PageHeader from "@/components/common/PageHeader";
import KpiGrid from "@/components/common/KpiGrid";
import KpiCard from "@/components/common/KpiCard";
import Card from "@/components/common/Card";
import StatusBadge from "@/components/common/StatusBadge";
import DataTable from "@/components/common/DataTable";

const syncCards = [
  {
    university: "서울대학교",
    lastSync: "2026-03-26 09:14",
    records: "45,230",
    status: "정상" as const,
  },
  {
    university: "연세대학교",
    lastSync: "2026-03-26 09:12",
    records: "38,750",
    status: "정상" as const,
  },
  {
    university: "고려대학교",
    lastSync: "2026-03-26 09:10",
    records: "41,820",
    status: "정상" as const,
  },
  {
    university: "한양대학교",
    lastSync: "2026-03-26 08:55",
    records: "29,100",
    status: "지연" as const,
  },
  {
    university: "성균관대학교",
    lastSync: "2026-03-26 08:45",
    records: "33,680",
    status: "정상" as const,
  },
  {
    university: "중앙대학교",
    lastSync: "2026-03-25 22:30",
    records: "25,410",
    status: "오류" as const,
  },
];

const syncLogs = [
  { time: "09:14:22", university: "서울대학교", type: "전체동기화", records: 45230, duration: "2m 34s", status: "성공" as const },
  { time: "09:12:08", university: "연세대학교", type: "증분동기화", records: 1250, duration: "0m 48s", status: "성공" as const },
  { time: "09:10:45", university: "고려대학교", type: "증분동기화", records: 890, duration: "0m 32s", status: "성공" as const },
  { time: "08:55:12", university: "한양대학교", type: "전체동기화", records: 29100, duration: "4m 12s", status: "지연" as const },
  { time: "08:45:33", university: "성균관대학교", type: "증분동기화", records: 2100, duration: "1m 05s", status: "성공" as const },
  { time: "08:30:01", university: "중앙대학교", type: "전체동기화", records: 0, duration: "—", status: "실패" as const },
  { time: "08:15:44", university: "경희대학교", type: "증분동기화", records: 540, duration: "0m 22s", status: "성공" as const },
  { time: "08:00:00", university: "동국대학교", type: "전체동기화", records: 18900, duration: "1m 58s", status: "성공" as const },
];

const syncStatusVariant = {
  정상: "success",
  지연: "warning",
  오류: "error",
} as const;

const syncStatusIcon: Record<string, string> = {
  정상: "check_circle",
  지연: "schedule",
  오류: "error",
};

const logStatusVariant = {
  성공: "success",
  지연: "warning",
  실패: "error",
} as const;

const logColumns = [
  { key: "time", label: "시간" },
  { key: "university", label: "대학" },
  { key: "type", label: "유형" },
  { key: "records", label: "건수", className: "text-right" },
  { key: "duration", label: "소요시간", className: "text-right" },
  { key: "status", label: "결과", className: "text-center" },
];

export default function KcuePage() {
  const logData = syncLogs.map((log) => ({
    time: (
      <span className="font-mono text-xs text-on-surface-variant">
        {log.time}
      </span>
    ),
    university: (
      <span className="font-medium">{log.university}</span>
    ),
    type: (
      <StatusBadge variant={log.type === "전체동기화" ? "warning" : "info"}>
        {log.type}
      </StatusBadge>
    ),
    records: (
      <span className="font-mono text-xs">{log.records.toLocaleString()}</span>
    ),
    duration: (
      <span className="text-xs text-on-surface-variant">{log.duration}</span>
    ),
    status: (
      <StatusBadge variant={logStatusVariant[log.status]} dot={log.status === "실패"}>
        {log.status}
      </StatusBadge>
    ),
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="한국대학교육협의회"
        description="대학 데이터 연동 현황 및 동기화 상태를 모니터링합니다."
        breadcrumb={["프로젝트", "한국대학교육협의회"]}
      />

      <KpiGrid>
        <KpiCard
          icon="account_balance"
          label="연동대학"
          value="189"
          change="+5 오늘"
          trend="up"
        />
        <KpiCard
          icon="database"
          label="데이터건수"
          value="1.2M"
          change="+24,800 오늘"
          trend="up"
        />
        <KpiCard
          icon="sync"
          label="최근동기화"
          value="14"
          suffix="분 전"
        />
        <KpiCard
          icon="error_outline"
          label="오류건수"
          value="3"
          change="-2 오늘"
          trend="down"
          alert
        />
      </KpiGrid>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase">
            대학별 동기화 현황
          </h2>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-sm">sync</span>
            전체 동기화
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {syncCards.map((card) => (
            <Card key={card.university} hover className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-on-surface">
                  {card.university}
                </h3>
                <span
                  className={`material-symbols-outlined text-lg ${
                    card.status === "정상"
                      ? "text-primary"
                      : card.status === "지연"
                        ? "text-tertiary"
                        : "text-error"
                  }`}
                >
                  {syncStatusIcon[card.status]}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">최근 동기화</span>
                  <span className="text-on-surface font-medium">
                    {card.lastSync}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">데이터 건수</span>
                  <span className="text-on-surface font-medium">
                    {card.records}건
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">상태</span>
                  <StatusBadge
                    variant={syncStatusVariant[card.status]}
                    dot={card.status === "오류"}
                  >
                    {card.status}
                  </StatusBadge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">
          동기화 로그
        </h2>
        <Card className="overflow-hidden">
          <DataTable columns={logColumns} data={logData} />
        </Card>
      </div>
    </div>
  );
}
