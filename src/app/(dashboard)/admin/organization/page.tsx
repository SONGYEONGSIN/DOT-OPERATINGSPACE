"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { PageHeader, KpiGrid, KpiCard } from "@/components/common";
import {
  IconUsers,
  IconCalendar,
  IconCake,
  IconGenderBigender,
} from "@tabler/icons-react";

interface Member {
  name: string;
  team: string;
  position: "부장" | "팀장" | "매니저";
  hireDate: string;
  birthDate: string;
  gender: "남" | "여";
  empNo: string;
  assignGroup?: number;
}

const MEMBERS: Member[] = [
  // 운영1팀
  {
    name: "허승철",
    team: "운영1팀",
    position: "부장",
    hireDate: "2008-06-01",
    birthDate: "1982-10-06",
    gender: "남",
    empNo: "200806010",
  },
  {
    name: "송영신",
    team: "운영2팀",
    position: "팀장",
    hireDate: "2013-10-14",
    birthDate: "1987-12-01",
    gender: "남",
    empNo: "20131004",
  },
  {
    name: "한효진",
    team: "운영1팀",
    position: "매니저",
    hireDate: "2007-05-30",
    birthDate: "1981-06-14",
    gender: "남",
    empNo: "20220701",
    assignGroup: 1,
  },
  {
    name: "김슬기",
    team: "운영1팀",
    position: "매니저",
    hireDate: "2011-02-07",
    birthDate: "1987-06-09",
    gender: "여",
    empNo: "20150703",
    assignGroup: 1,
  },
  {
    name: "김지영",
    team: "운영1팀",
    position: "매니저",
    hireDate: "2016-07-27",
    birthDate: "1989-09-26",
    gender: "여",
    empNo: "20160702",
    assignGroup: 2,
  },
  {
    name: "정윤나",
    team: "운영1팀",
    position: "매니저",
    hireDate: "2019-08-01",
    birthDate: "1995-09-16",
    gender: "여",
    empNo: "20190801",
    assignGroup: 3,
  },
  {
    name: "김유민",
    team: "운영1팀",
    position: "매니저",
    hireDate: "2023-05-18",
    birthDate: "1998-09-07",
    gender: "여",
    empNo: "20230506",
    assignGroup: 4,
  },
  {
    name: "기자의",
    team: "운영1팀",
    position: "매니저",
    hireDate: "2024-05-02",
    birthDate: "1999-03-13",
    gender: "여",
    empNo: "20240501",
    assignGroup: 5,
  },
  {
    name: "전지은",
    team: "운영1팀",
    position: "매니저",
    hireDate: "2025-07-14",
    birthDate: "2001-03-12",
    gender: "여",
    empNo: "20250701",
    assignGroup: 6,
  },
  // 운영2팀
  {
    name: "윤지혜",
    team: "운영2팀",
    position: "매니저",
    hireDate: "2005-05-30",
    birthDate: "1984-10-22",
    gender: "여",
    empNo: "200505310",
    assignGroup: 1,
  },
  {
    name: "박시현",
    team: "운영2팀",
    position: "매니저",
    hireDate: "2010-08-05",
    birthDate: "1984-03-13",
    gender: "여",
    empNo: "201008010",
    assignGroup: 1,
  },
  {
    name: "이해영",
    team: "운영2팀",
    position: "매니저",
    hireDate: "2017-06-12",
    birthDate: "1993-02-01",
    gender: "여",
    empNo: "20170602",
    assignGroup: 2,
  },
  {
    name: "임종우",
    team: "운영2팀",
    position: "매니저",
    hireDate: "2022-01-10",
    birthDate: "1995-08-20",
    gender: "남",
    empNo: "20220101",
    assignGroup: 3,
  },
  {
    name: "전혜인",
    team: "운영2팀",
    position: "매니저",
    hireDate: "2023-05-18",
    birthDate: "1998-12-13",
    gender: "여",
    empNo: "20230505",
    assignGroup: 4,
  },
  {
    name: "김지현",
    team: "운영2팀",
    position: "매니저",
    hireDate: "2024-05-02",
    birthDate: "1997-12-10",
    gender: "여",
    empNo: "20240502",
    assignGroup: 5,
  },
  {
    name: "김지나",
    team: "운영2팀",
    position: "매니저",
    hireDate: "2024-07-08",
    birthDate: "2000-02-02",
    gender: "여",
    empNo: "20240702",
    assignGroup: 6,
  },
  {
    name: "김승현",
    team: "운영2팀",
    position: "매니저",
    hireDate: "2025-10-27",
    birthDate: "2000-11-20",
    gender: "여",
    empNo: "P20250505",
    assignGroup: 6,
  },
];

const POSITION_PRIORITY = { 부장: 0, 팀장: 1, 매니저: 2 } as const;

function calcYears(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.max(
    0,
    (now.getTime() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
}

function formatTenure(years: number): string {
  const y = Math.floor(years);
  const m = Math.floor((years - y) * 12);
  return `${y}년 ${m}개월`;
}

function getTenureColor(years: number): string {
  if (years >= 15) return "bg-primary text-on-primary";
  if (years >= 10) return "bg-primary/50 text-on-primary";
  if (years >= 5) return "bg-primary/30 text-primary";
  if (years >= 2) return "bg-primary/15 text-primary";
  return "bg-primary/8 text-primary";
}

function getGaugeGradient(ratio: number): string {
  if (ratio >= 0.7)
    return "linear-gradient(90deg, rgba(120,160,30,0.3), rgba(120,160,30,0.5))";
  return "linear-gradient(90deg, rgba(120,160,30,0.15), rgba(120,160,30,0.35))";
}

function getPositionStyle(position: string): string {
  switch (position) {
    case "부장":
      return "bg-tertiary/15 text-tertiary border-tertiary/20";
    case "팀장":
      return "bg-primary/15 text-primary border-primary/20";
    default:
      return "";
  }
}

type EnrichedMember = Member & { tenureYears: number; age: number };

export default function OrganizationPage() {
  const enriched: EnrichedMember[] = useMemo(
    () =>
      MEMBERS.map((m) => ({
        ...m,
        tenureYears: calcYears(m.hireDate),
        age: calcYears(m.birthDate),
      })),
    [],
  );

  const teams = useMemo(() => {
    const map = new Map<string, EnrichedMember[]>();
    for (const m of enriched) {
      const list = map.get(m.team) ?? [];
      list.push(m);
      map.set(m.team, list);
    }
    for (const [, members] of map) {
      members.sort((a, b) => {
        const pDiff =
          POSITION_PRIORITY[a.position] - POSITION_PRIORITY[b.position];
        if (pDiff !== 0) return pDiff;
        return b.tenureYears - a.tenureYears;
      });
    }
    return map;
  }, [enriched]);

  const maxTenure = Math.max(...enriched.map((m) => m.tenureYears));
  const totalCount = enriched.length;
  const avgTenure =
    enriched.reduce((s, m) => s + m.tenureYears, 0) / totalCount;
  const avgAge = enriched.reduce((s, m) => s + m.age, 0) / totalCount;
  const maleCount = enriched.filter((m) => m.gender === "남").length;
  const femaleCount = enriched.filter((m) => m.gender === "여").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="조직구성"
        description="어플라이사업본부 · 운영부"
        breadcrumb={["관리자", "조직구성"]}
      />

      {/* KPI Cards */}
      <KpiGrid>
        <KpiCard
          icon={<IconUsers size={18} className="text-on-surface-variant" />}
          label="총 인원"
          value={totalCount.toString()}
          suffix="명"
          change={`운영1팀 ${[...(teams.get("운영1팀") ?? [])].length} · 운영2팀 ${[...(teams.get("운영2팀") ?? [])].length}`}
        />
        <KpiCard
          icon={<IconCalendar size={18} className="text-on-surface-variant" />}
          label="평균 근속"
          value={avgTenure.toFixed(1)}
          suffix="년"
        />
        <KpiCard
          icon={<IconCake size={18} className="text-on-surface-variant" />}
          label="평균 연령"
          value={avgAge.toFixed(1)}
          suffix="세"
        />
        <KpiCard
          icon={
            <IconGenderBigender size={18} className="text-on-surface-variant" />
          }
          label="성비"
          value={`${maleCount}:${femaleCount}`}
          change={`남 ${maleCount}명 · 여 ${femaleCount}명`}
        />
      </KpiGrid>

      {/* Team Sections */}
      {[...teams.entries()].map(([teamName, members]) => {
        const teamAvgTenure =
          members.reduce((s, m) => s + m.tenureYears, 0) / members.length;
        const teamAvgAge =
          members.reduce((s, m) => s + m.age, 0) / members.length;

        const tiers = [
          {
            label: "15년+",
            count: members.filter((m) => m.tenureYears >= 15).length,
            cls: "bg-primary",
          },
          {
            label: "10~15",
            count: members.filter(
              (m) => m.tenureYears >= 10 && m.tenureYears < 15,
            ).length,
            cls: "bg-primary/60",
          },
          {
            label: "5~10",
            count: members.filter(
              (m) => m.tenureYears >= 5 && m.tenureYears < 10,
            ).length,
            cls: "bg-primary/35",
          },
          {
            label: "2~5",
            count: members.filter(
              (m) => m.tenureYears >= 2 && m.tenureYears < 5,
            ).length,
            cls: "bg-primary/20",
          },
          {
            label: "~2년",
            count: members.filter((m) => m.tenureYears < 2).length,
            cls: "bg-primary/10",
          },
        ].filter((t) => t.count > 0);

        return (
          <section key={teamName}>
            {/* Team Header */}
            <div className="flex items-center justify-between mb-2 px-3.5">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-extrabold text-primary uppercase tracking-[0.15em]">
                  {teamName}
                </span>
                <span className="text-[9px] text-on-surface-variant">
                  {members.length}명 · 평균 {teamAvgTenure.toFixed(1)}년 ·{" "}
                  {teamAvgAge.toFixed(0)}세
                </span>
              </div>

              {/* Team DNA - tenure distribution */}
              <div className="flex items-center gap-1">
                <div className="flex h-4 rounded-md overflow-hidden">
                  {tiers.map((tier) => (
                    <div
                      key={tier.label}
                      className={cn(
                        "h-full flex items-center justify-center text-[7px] font-bold",
                        tier.cls,
                        tier.cls.includes("primary/10") ||
                          tier.cls.includes("primary/20")
                          ? "text-primary"
                          : "text-on-primary",
                      )}
                      style={{
                        width: `${Math.max((tier.count / members.length) * 120, 24)}px`,
                      }}
                      title={`${tier.label}: ${tier.count}명`}
                    >
                      {tier.count}
                    </div>
                  ))}
                </div>
                <span className="text-[7px] text-on-surface-variant/40 ml-0.5">
                  연차분포
                </span>
              </div>
            </div>

            {/* Member Lanes */}
            <div className="space-y-1.5">
              {members.map((member) => {
                const tenurePct =
                  maxTenure > 0 ? (member.tenureYears / maxTenure) * 100 : 0;

                return (
                  <div
                    key={member.empNo}
                    className={cn(
                      "rounded-[10px] bg-surface-container border transition-all",
                      member.position !== "매니저"
                        ? "border-outline-variant/15"
                        : "border-outline-variant/5 hover:border-outline-variant/10",
                    )}
                  >
                    <div className="flex items-center gap-0">
                      {/* Left: Badge + Name */}
                      <div className="w-[170px] shrink-0 px-3.5 py-2.5 flex items-center gap-2.5 border-r border-outline-variant/5">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-black shrink-0",
                            getTenureColor(member.tenureYears),
                          )}
                        >
                          {Math.floor(member.tenureYears)}
                        </div>
                        <div className="text-left min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-on-surface">
                              {member.name}
                            </span>
                            {member.position !== "매니저" && (
                              <span
                                className={cn(
                                  "text-[7px] font-bold px-1.5 py-0.5 rounded border",
                                  getPositionStyle(member.position),
                                )}
                              >
                                {member.position}
                              </span>
                            )}
                          </div>
                          <div className="text-[8px] text-on-surface-variant">
                            {member.hireDate.slice(0, 7)} 입사
                            {member.assignGroup && (
                              <span className="text-primary ml-1.5 font-bold">
                                {member.assignGroup}G
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Center: Tenure Gauge */}
                      <div className="flex-1 px-3.5 py-2 flex items-center gap-2 min-h-[44px]">
                        <div className="flex-1 h-7 bg-surface-dim rounded-md overflow-hidden relative">
                          <div
                            className="h-full rounded-md transition-[width] duration-500 ease-out"
                            style={{
                              width: `${tenurePct}%`,
                              background: getGaugeGradient(tenurePct / 100),
                            }}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-primary bg-surface/80 px-1.5 rounded">
                            {formatTenure(member.tenureYears)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Age + Gender */}
                      <div className="w-[70px] shrink-0 text-center py-2 border-l border-outline-variant/5">
                        <div className="text-sm font-black text-on-surface tabular-nums">
                          {Math.floor(member.age)}
                        </div>
                        <div className="text-[7px] text-on-surface-variant uppercase">
                          {member.gender === "남" ? "M" : "F"} · 세
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
