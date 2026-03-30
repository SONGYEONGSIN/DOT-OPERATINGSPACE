import PageHeader from "@/components/common/PageHeader";
import KpiGrid from "@/components/common/KpiGrid";
import KpiCard from "@/components/common/KpiCard";
import Card from "@/components/common/Card";
import StatusBadge from "@/components/common/StatusBadge";
import DataTable from "@/components/common/DataTable";

const requests = [
  {
    id: "REF-2026-0342",
    date: "2026-03-26",
    referrer: "김정훈",
    referrerOrg: "서울대학교",
    referee: "이수민",
    refereeOrg: "고려대학교",
    relationship: "지도교수",
    status: "대기중" as const,
  },
  {
    id: "REF-2026-0341",
    date: "2026-03-26",
    referrer: "박영진",
    referrerOrg: "연세대학교",
    referee: "최현우",
    refereeOrg: "한양대학교",
    relationship: "직장동료",
    status: "대기중" as const,
  },
  {
    id: "REF-2026-0340",
    date: "2026-03-25",
    referrer: "장미란",
    referrerOrg: "성균관대학교",
    referee: "오세준",
    refereeOrg: "중앙대학교",
    relationship: "학과선배",
    status: "승인" as const,
  },
  {
    id: "REF-2026-0339",
    date: "2026-03-25",
    referrer: "한소희",
    referrerOrg: "경희대학교",
    referee: "윤지호",
    refereeOrg: "동국대학교",
    relationship: "연구파트너",
    status: "승인" as const,
  },
  {
    id: "REF-2026-0338",
    date: "2026-03-25",
    referrer: "조민수",
    referrerOrg: "이화여자대학교",
    referee: "강태영",
    refereeOrg: "서강대학교",
    relationship: "지도교수",
    status: "반려" as const,
  },
  {
    id: "REF-2026-0337",
    date: "2026-03-24",
    referrer: "서준혁",
    referrerOrg: "한국외국어대학교",
    referee: "임채원",
    refereeOrg: "건국대학교",
    relationship: "직장동료",
    status: "승인" as const,
  },
  {
    id: "REF-2026-0336",
    date: "2026-03-24",
    referrer: "나현정",
    referrerOrg: "숙명여자대학교",
    referee: "배진우",
    refereeOrg: "아주대학교",
    relationship: "학과선배",
    status: "반려" as const,
  },
  {
    id: "REF-2026-0335",
    date: "2026-03-24",
    referrer: "문성호",
    referrerOrg: "인하대학교",
    referee: "권예린",
    refereeOrg: "부산대학교",
    relationship: "지도교수",
    status: "승인" as const,
  },
];

const statusVariant = {
  대기중: "warning",
  승인: "success",
  반려: "error",
} as const;

const relationshipVariant: Record<string, "success" | "info" | "warning"> = {
  지도교수: "success",
  직장동료: "info",
  학과선배: "warning",
  연구파트너: "success",
};

const columns = [
  { key: "id", label: "요청번호" },
  { key: "date", label: "요청일" },
  { key: "referrer", label: "추천인" },
  { key: "referee", label: "피추천인" },
  { key: "relationship", label: "관계", className: "text-center" },
  { key: "status", label: "상태", className: "text-center" },
  { key: "action", label: "작업", className: "text-center" },
];

export default function ReferralPage() {
  const tableData = requests.map((req) => ({
    id: (
      <span className="font-mono text-xs text-primary font-semibold">
        {req.id}
      </span>
    ),
    date: (
      <span className="text-on-surface-variant text-xs">{req.date}</span>
    ),
    referrer: (
      <div>
        <p className="text-on-surface font-medium text-sm">{req.referrer}</p>
        <p className="text-on-surface-variant text-xs">{req.referrerOrg}</p>
      </div>
    ),
    referee: (
      <div>
        <p className="text-on-surface font-medium text-sm">{req.referee}</p>
        <p className="text-on-surface-variant text-xs">{req.refereeOrg}</p>
      </div>
    ),
    relationship: (
      <StatusBadge variant={relationshipVariant[req.relationship] ?? "neutral"}>
        {req.relationship}
      </StatusBadge>
    ),
    status: (
      <StatusBadge
        variant={statusVariant[req.status]}
        dot={req.status === "대기중"}
      >
        {req.status}
      </StatusBadge>
    ),
    action:
      req.status === "대기중" ? (
        <div className="flex items-center justify-center gap-1">
          <button className="p-1 rounded-md hover:bg-primary/10 text-primary transition-colors">
            <span className="material-symbols-outlined text-base">check</span>
          </button>
          <button className="p-1 rounded-md hover:bg-error/10 text-error transition-colors">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <button className="p-1 rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-base">
              visibility
            </span>
          </button>
        </div>
      ),
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="추천인검증"
        description="추천인 검증 요청을 관리하고 승인 현황을 확인합니다."
        breadcrumb={["프로젝트", "추천인검증"]}
      />

      <KpiGrid>
        <KpiCard
          icon="verified_user"
          label="검증요청"
          value="1,284"
          change="+48 이번 주"
          trend="up"
        />
        <KpiCard
          icon="check_circle"
          label="승인"
          value="1,102"
          change="+32 이번 주"
          trend="up"
        />
        <KpiCard
          icon="cancel"
          label="반려"
          value="94"
          change="+7 이번 주"
          trend="up"
        />
        <KpiCard
          icon="hourglass_top"
          label="대기중"
          value="88"
          change="+9 현재"
          trend="neutral"
        />
      </KpiGrid>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase">
            검증 요청 목록
          </h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-bold hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined text-sm">
                filter_list
              </span>
              필터
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-sm">
                download
              </span>
              내보내기
            </button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <DataTable columns={columns} data={tableData} />
        </Card>
      </div>
    </div>
  );
}
