import PageHeader from "@/components/common/PageHeader";
import KpiGrid from "@/components/common/KpiGrid";
import KpiCard from "@/components/common/KpiCard";
import Card from "@/components/common/Card";
import DataTable from "@/components/common/DataTable";
import ProgressBar from "@/components/common/ProgressBar";
import TableSection from "@/components/common/TableSection";
import { IconTarget, IconGauge, IconTrendingUp, IconChartBar, IconArrowUp, IconArrowDown } from "@tabler/icons-react";

const monthlyData = [
  { month: "10월", score: 72, target: 80 },
  { month: "11월", score: 78, target: 80 },
  { month: "12월", score: 81, target: 85 },
  { month: "1월", score: 84, target: 85 },
  { month: "2월", score: 87, target: 85 },
  { month: "3월", score: 92, target: 90 },
];

const teamRanking = [
  { rank: 1, team: "개발팀", score: 95.2, change: 0, members: 12, completion: 98 },
  { rank: 2, team: "운영팀", score: 92.0, change: 1, members: 8, completion: 94 },
  { rank: 3, team: "마케팅팀", score: 88.5, change: -1, members: 6, completion: 89 },
  { rank: 4, team: "디자인팀", score: 86.3, change: 2, members: 5, completion: 87 },
  { rank: 5, team: "기획팀", score: 84.1, change: -1, members: 7, completion: 82 },
  { rank: 6, team: "영업팀", score: 81.7, change: 0, members: 9, completion: 80 },
];

const maxScore = Math.max(...monthlyData.map((d) => Math.max(d.score, d.target)));

const rankColumns = [
  { key: "rank", label: "순위", className: "w-16" },
  { key: "team", label: "팀명" },
  { key: "score", label: "점수", className: "w-20" },
  { key: "progress", label: "달성률" },
  { key: "change", label: "변동", className: "w-16" },
];

function ChangeIndicator({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span className="flex items-center gap-0.5 text-primary">
        <IconArrowUp size={12} />
        <span className="text-[10px] font-bold">{change}</span>
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="flex items-center gap-0.5 text-error">
        <IconArrowDown size={12} />
        <span className="text-[10px] font-bold">{Math.abs(change)}</span>
      </span>
    );
  }
  return <span className="text-[10px] text-on-surface-variant font-bold">-</span>;
}

export default function PerformancePage() {
  const rankData = teamRanking.map((team) => ({
    rank: (
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
          team.rank === 1
            ? "bg-primary text-on-primary"
            : team.rank === 2
              ? "bg-primary/20 text-primary"
              : "bg-surface-container-high text-on-surface-variant"
        }`}
      >
        {team.rank}
      </div>
    ),
    team: (
      <div>
        <span className="text-sm font-semibold text-on-surface">{team.team}</span>
        <span className="text-[10px] text-on-surface-variant ml-2">{team.members}명</span>
      </div>
    ),
    score: <span className="text-sm font-black text-on-surface">{team.score}</span>,
    progress: (
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <ProgressBar value={team.completion} />
        </div>
        <span className="text-[10px] text-on-surface-variant font-medium w-8 text-right">
          {team.completion}%
        </span>
      </div>
    ),
    change: <ChangeIndicator change={team.change} />,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="성과"
        description="팀 성과 지표를 모니터링하고 목표 달성 현황을 확인하세요."
        breadcrumb={["분석 & 보고", "성과"]}
      />

      <KpiGrid>
        <KpiCard
          icon={<IconTarget size={18} className="text-on-surface-variant" />}
          label="목표달성률"
          value="87.4"
          suffix="%"
          change="+3.2%"
          trend="up"
        />
        <KpiCard
          icon={<IconGauge size={18} className="text-on-surface-variant" />}
          label="KPI 점수"
          value="92"
          suffix="점"
          change="+5점"
          trend="up"
        />
        <KpiCard
          icon={<IconTrendingUp size={18} className="text-on-surface-variant" />}
          label="전월대비"
          value="+12.8"
          suffix="%"
          change="상승세"
          trend="up"
        />
        <KpiCard
          icon={<IconChartBar size={18} className="text-on-surface-variant" />}
          label="팀 순위"
          value="2"
          suffix="위"
          change="1단계 상승"
          trend="up"
        />
      </KpiGrid>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Monthly Performance Bar Chart */}
        <Card className="lg:col-span-3 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-on-surface">월별 성과 추이</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                최근 6개월 KPI 점수와 목표치 비교
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-primary" />
                <span className="text-on-surface-variant">실적</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-outline-variant border border-outline-variant" />
                <span className="text-on-surface-variant">목표</span>
              </div>
            </div>
          </div>

          <div className="relative h-56">
            <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] text-on-surface-variant">
              <span>100</span>
              <span>80</span>
              <span>60</span>
            </div>
            <div className="ml-10 h-full flex items-end gap-3 pb-6">
              {monthlyData.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    <div
                      className="w-5 bg-primary/80 rounded-t-md hover:bg-primary transition-colors relative group"
                      style={{ height: `${(d.score / maxScore) * 100}%` }}
                    >
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.score}
                      </div>
                    </div>
                    <div
                      className="w-5 bg-outline-variant/40 rounded-t-md border border-outline-variant/30"
                      style={{ height: `${(d.target / maxScore) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    {d.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Team Ranking */}
        <div className="lg:col-span-2">
          <TableSection totalCount={teamRanking.length}>
            <div className="px-5 py-4 border-b border-outline-variant/10">
              <h2 className="text-base font-bold text-on-surface">팀 순위</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                이번 분기 팀별 성과 순위
              </p>
            </div>
            <DataTable columns={rankColumns} data={rankData} />
          </TableSection>
        </div>
      </div>
    </div>
  );
}
