import { PageHeader, KpiGrid, KpiCard, Card } from "@/components/common";
import {
  IconSchool,
  IconUsers,
  IconUserOff,
  IconDatabase,
} from "@tabler/icons-react";
import {
  fetchAssignments,
  fetchBaseData,
  type AssignmentData,
} from "@/lib/sharepoint";
import { getAssignmentResults } from "./actions";
import { ALL_OPERATORS } from "./constants";
import ProgressCards from "./ProgressCards";
import WorkloadHeatmap, { type CellUniv } from "./WorkloadHeatmap";
import AssignmentWizard from "./AssignmentWizard";

const YEAR = 2027;

interface UnivEntry {
  universityName: string;
  category: string;
  region: string;
  currentOperator: string;
}

interface PhaseTypeConfig {
  label: string;
  assignType: string;
  secondAssignType?: string;
  directAssign?: boolean;
  getUniversities: (
    data: NonNullable<Awaited<ReturnType<typeof fetchAssignments>>>,
  ) => UnivEntry[];
  getUniversities2?: (
    data: NonNullable<Awaited<ReturnType<typeof fetchAssignments>>>,
  ) => UnivEntry[];
}

const PHASE_TYPES: Record<string, PhaseTypeConfig> = {
  // Phase 1: 수시
  susi_4year: {
    label: "4년제 수시",
    assignType: "susi",
    getUniversities: (d) =>
      d.assignments
        .filter((a) => a.category === "4년제")
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
          currentOperator: a.op2027.susi,
        })),
  },
  susi_junmun: {
    label: "전문대 수시",
    assignType: "susi",
    getUniversities: (d) =>
      d.assignments
        .filter((a) => a.category === "전문대학" || a.category === "폴리텍")
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
          currentOperator: a.op2027.susi,
        })),
  },
  // Phase 2: 정시
  jungsi_4year: {
    label: "4년제 정시",
    assignType: "jungsi",
    getUniversities: (d) =>
      d.assignments
        .filter((a) => a.category === "4년제")
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
          currentOperator: a.op2027.jungsi,
        })),
  },
  jungsi_junmun: {
    label: "전문대 정시",
    assignType: "jungsi",
    getUniversities: (d) =>
      d.assignments
        .filter((a) => a.category === "전문대학" || a.category === "폴리텍")
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
          currentOperator: a.op2027.jungsi,
        })),
  },
  // Phase 3: 나머지
  k12: {
    label: "초중고",
    assignType: "k12",
    getUniversities: (d) =>
      d.assignments
        .filter((a) => a.category === "초중고")
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
          currentOperator: a.op2027.susi,
        })),
  },
  special: {
    label: "특수대학",
    assignType: "susi",
    getUniversities: (d) =>
      d.assignments
        .filter((a) => a.category === "특수대학")
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
          currentOperator: a.op2027.susi,
        })),
  },
  etc: {
    label: "기타",
    assignType: "susi",
    getUniversities: (d) =>
      d.assignments
        .filter((a) => a.category === "기타")
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
          currentOperator: a.op2027.susi,
        })),
  },
  school: {
    label: "전문학교",
    assignType: "susi",
    getUniversities: (d) =>
      d.assignments
        .filter((a) => a.category.includes("전문학교"))
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
          currentOperator: a.op2027.susi,
        })),
  },
  jaewoe: {
    label: "재외국민",
    assignType: "jaewoe",
    getUniversities: (d) =>
      d.assignments
        .filter((a) => a.category === "4년제")
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
          currentOperator: a.op2027.jaewoe,
        })),
  },
  pyeonip: {
    label: "편입",
    assignType: "pyeonip",
    getUniversities: (d) =>
      d.assignments
        .filter((a) => a.category === "4년제" || a.category === "전문대학")
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
          currentOperator: a.op2027.pyeonip,
        })),
  },
  foreigner: {
    label: "외국인",
    assignType: "foreigner",
    getUniversities: (d) =>
      d.assignments
        .filter((a) => a.category === "4년제")
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
          currentOperator: a.op2027.foreigner,
        })),
  },
  // Phase 4: 별도 시트
  grad: {
    label: "대학원",
    assignType: "grad",
    getUniversities: (d) =>
      d.gradAssignments.map((g) => ({
        universityName: g.universityName,
        category: "대학원",
        region: "",
        currentOperator: g.operator,
      })),
  },
  pims: {
    label: "PIMS",
    assignType: "pims_full",
    secondAssignType: "pims_select",
    getUniversities: (d) =>
      d.pimsAssignments
        .filter((p) => p.operatorFull)
        .map((p) => ({
          universityName: p.universityName,
          category: p.category,
          region: p.region,
          currentOperator: p.operatorFull,
        })),
    getUniversities2: (d) =>
      d.pimsAssignments
        .filter((p) => p.operatorReception)
        .map((p) => ({
          universityName: p.universityName,
          category: p.category,
          region: p.region,
          currentOperator: p.operatorReception,
        })),
  },
  score: {
    label: "성적산출",
    assignType: "score",
    getUniversities: (d) =>
      d.scoreAssignments.map((s) => ({
        universityName: s.universityName,
        category: "성적산출",
        region: "",
        currentOperator: s.operator,
      })),
  },
  app: {
    label: "상담앱",
    assignType: "app",
    getUniversities: (d) =>
      d.appAssignments.map((a) => ({
        universityName: a.universityName,
        category: "상담앱",
        region: "",
        currentOperator: a.operator,
      })),
  },
};

const PHASES = [
  {
    phase: 1,
    label: "수시 (4년제+전문대)",
    types: ["susi_4year", "susi_junmun"],
  },
  {
    phase: 2,
    label: "정시 (4년제+전문대)",
    types: ["jungsi_4year", "jungsi_junmun"],
  },
  {
    phase: 3,
    label: "나머지 배정리스트",
    types: [
      "k12",
      "special",
      "etc",
      "school",
      "jaewoe",
      "pyeonip",
      "foreigner",
    ],
  },
  {
    phase: 4,
    label: "별도 시트",
    types: ["grad", "pims", "score", "app"],
  },
];

const SUSI_CATS = new Set(["4년제", "전문대학", "폴리텍"]);

function buildHeatmapDetails(
  d: NonNullable<Awaited<ReturnType<typeof fetchAssignments>>>,
): Record<string, Record<string, CellUniv[]>> {
  const result: Record<string, Record<string, CellUniv[]>> = {};
  const names = new Set<string>(ALL_OPERATORS);
  d.operatorSummary.forEach((o) => names.add(o.name));

  for (const name of names) {
    result[name] = {
      susiTotal: d.assignments
        .filter((a) => a.op2027.susi === name && SUSI_CATS.has(a.category))
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
        })),
      jungsiTotal: d.assignments
        .filter((a) => a.op2027.jungsi === name && SUSI_CATS.has(a.category))
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
        })),
      etcJaewoe: d.assignments
        .filter((a) => a.op2027.jaewoe === name)
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
        })),
      etcForeign: d.assignments
        .filter((a) => a.op2027.foreigner === name)
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
        })),
      etcK12: d.assignments
        .filter((a) => a.op2027.susi === name && a.category === "초중고")
        .map((a) => ({
          universityName: a.universityName,
          category: a.category,
          region: a.region,
        })),
      etcGrad: d.gradAssignments
        .filter((g) => g.operator === name)
        .map((g) => ({
          universityName: g.universityName,
          category: "대학원",
          region: "",
        })),
      etcPimsFull: [
        ...d.pimsAssignments
          .filter((p) => p.operatorFull === name)
          .map((p) => ({
            universityName: p.universityName,
            category: `${p.category} · 전체`,
            region: p.region,
          })),
        ...d.pimsAssignments
          .filter(
            (p) => p.operatorReception === name && p.operatorFull !== name,
          )
          .map((p) => ({
            universityName: p.universityName,
            category: `${p.category} · 선택`,
            region: p.region,
          })),
      ],
      etcScore: d.scoreAssignments
        .filter((s) => s.operator === name)
        .map((s) => ({
          universityName: s.universityName,
          category: "성적산출",
          region: "",
        })),
      etcApp: d.appAssignments
        .filter((a) => a.operator === name)
        .map((a) => ({
          universityName: a.universityName,
          category: "상담앱",
          region: "",
        })),
    };
  }
  return result;
}

interface PageProps {
  searchParams: Promise<{ type?: string; step?: string }>;
}

export default async function AssignmentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeType = params.type ?? null;

  const [data, existingResults, baseData] = await Promise.all([
    fetchAssignments(),
    getAssignmentResults(YEAR),
    fetchBaseData(),
  ]);

  if (!data) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="대학배정"
          description="대학 운영자 배정을 관리합니다."
          breadcrumb={["관리자", "대학배정"]}
        />
        <Card className="p-16 text-center">
          <p className="text-sm text-on-surface-variant">
            배정 데이터를 불러올 수 없습니다.
          </p>
        </Card>
      </div>
    );
  }

  const { operatorSummary, assignments } = data;

  const resultSet = new Set(
    existingResults.map((r) => `${r.university_name}__${r.assignment_type}`),
  );

  // Build phase info with progress data
  const phaseInfos = PHASES.map((phase) => {
    const typeDetails = phase.types.map((typeKey) => {
      const config = PHASE_TYPES[typeKey];
      const univs = config.getUniversities(data);
      const assigned = univs.filter((u) =>
        resultSet.has(`${u.universityName}__${config.assignType}`),
      ).length;
      return {
        type: typeKey,
        label: config.label,
        total: univs.length,
        assigned,
      };
    });

    const totalAll = typeDetails.reduce((s, t) => s + t.total, 0);
    const totalAssigned = typeDetails.reduce((s, t) => s + t.assigned, 0);
    const pct = totalAll > 0 ? totalAssigned / totalAll : 0;
    const status =
      pct >= 1
        ? ("done" as const)
        : pct > 0
          ? ("active" as const)
          : ("todo" as const);

    return {
      phase: phase.phase,
      label: phase.label,
      types: typeDetails,
      status,
    };
  });

  const totalUnivs = assignments.length;
  const unassignedCount = phaseInfos.reduce(
    (sum, p) => sum + p.types.reduce((s, t) => s + (t.total - t.assigned), 0),
    0,
  );

  // Wizard mode
  if (activeType && PHASE_TYPES[activeType]) {
    const config = PHASE_TYPES[activeType];
    const universities = config.getUniversities(data);
    const universities2 = config.getUniversities2?.(data);

    return (
      <div className="space-y-6">
        <PageHeader
          title="대학배정"
          description={`${YEAR}학년도 ${config.label} 배정`}
          breadcrumb={["관리자", "대학배정", config.label]}
        />
        <AssignmentWizard
          year={YEAR}
          assignType={config.assignType}
          secondAssignType={config.secondAssignType}
          typeLabel={config.label}
          universities={universities}
          universities2={universities2}
          existingResults={existingResults}
          baseStats={baseData?.operatorStats ?? []}
          directAssign={config.directAssign}
        />
      </div>
    );
  }

  // Dashboard mode
  return (
    <div className="space-y-6">
      <PageHeader
        title="대학배정"
        description={`${YEAR}학년도 운영자 대학배정 관리`}
        breadcrumb={["관리자", "대학배정"]}
      />

      <KpiGrid>
        <KpiCard
          icon={<IconSchool size={18} className="text-on-surface-variant" />}
          label="총 대학"
          value={totalUnivs.toString()}
          suffix="개"
          change={`4년제 ${assignments.filter((a) => a.category === "4년제").length} / 전문대 ${assignments.filter((a) => a.category === "전문대학").length}`}
        />
        <KpiCard
          icon={<IconUsers size={18} className="text-on-surface-variant" />}
          label="운영자"
          value={ALL_OPERATORS.length.toString()}
          suffix="명"
          change="6개 그룹"
        />
        <KpiCard
          icon={<IconUserOff size={18} className="text-on-surface-variant" />}
          label="미배정"
          value={unassignedCount.toString()}
          suffix="건"
          alert={unassignedCount > 0}
        />
        <KpiCard
          icon={<IconDatabase size={18} className="text-on-surface-variant" />}
          label="기초자료"
          value={(baseData?.items.length ?? 0).toString()}
          suffix="건"
        />
      </KpiGrid>

      <section>
        <div className="mb-4">
          <h3 className="text-sm font-bold text-on-surface">배정 Phase</h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Phase를 선택하여 배정 위자드를 시작합니다.
          </p>
        </div>
        <ProgressCards phases={phaseInfos} />
      </section>

      <section>
        <WorkloadHeatmap
          operatorSummary={operatorSummary}
          cellDetails={buildHeatmapDetails(data)}
        />
      </section>
    </div>
  );
}
