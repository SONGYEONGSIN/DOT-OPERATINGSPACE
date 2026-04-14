import { PageHeader, KpiGrid, KpiCard, Card } from "@/components/common";
import {
  IconSchool,
  IconUsers,
  IconNetwork,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { fetchAssignments } from "@/lib/sharepoint";
import AssignmentExplorer, { type UniversityData } from "./AssignmentExplorer";

export default async function OperatorAssignmentsPage() {
  const data = await fetchAssignments();

  if (!data) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="담당자배정"
          description="운영자/개발자 배정 현황을 조회합니다."
          breadcrumb={["운영", "담당자배정"]}
        />
        <Card className="p-16 text-center">
          <p className="text-sm text-on-surface-variant">
            데이터를 불러올 수 없습니다.
          </p>
        </Card>
      </div>
    );
  }

  const {
    operatorSummary,
    developerSummary,
    assignments,
    gradAssignments,
    pimsAssignments,
    scoreAssignments,
    appAssignments,
  } = data;

  // 대학별 통합 데이터 빌드
  const uniMap = new Map<string, UniversityData>();

  for (const a of assignments) {
    uniMap.set(a.universityName, {
      universityName: a.universityName,
      category: a.category,
      region: a.region,
      salesperson: a.salesperson,
      changed: a.changed,
      remark: a.remark,
      main: {
        opSusi: a.op2027.susi,
        opJungsi: a.op2027.jungsi,
        devSusi: a.dev2027.susi,
        devJungsi: a.dev2027.jungsi,
        jaewoe: a.op2027.jaewoe,
        foreigner: a.op2027.foreigner,
        pyeonip: a.op2027.pyeonip,
        devJaewoe: a.dev2027.jaewoe,
        devForeigner: a.dev2027.foreigner,
        devPyeonip: a.dev2027.pyeonip,
      },
    });
  }

  for (const g of gradAssignments) {
    const existing = uniMap.get(g.universityName) ?? {
      universityName: g.universityName,
    };
    uniMap.set(g.universityName, {
      ...existing,
      changed: g.changed?.includes("변경 O") ? g.changed : existing.changed,
      grad: { operator: g.operator, developer: g.developer },
    });
  }

  for (const p of pimsAssignments) {
    const existing = uniMap.get(p.universityName) ?? {
      universityName: p.universityName,
      category: p.category,
      region: p.region,
    };
    uniMap.set(p.universityName, {
      ...existing,
      changed: p.changed?.includes("변경 O") ? p.changed : existing.changed,
      pims: {
        operatorFull: p.operatorFull,
        operatorReception: p.operatorReception,
      },
    });
  }

  for (const s of scoreAssignments) {
    const existing = uniMap.get(s.universityName) ?? {
      universityName: s.universityName,
    };
    uniMap.set(s.universityName, {
      ...existing,
      score: { operator: s.operator, developer: s.developer },
    });
  }

  for (const a of appAssignments) {
    const existing = uniMap.get(a.universityName) ?? {
      universityName: a.universityName,
    };
    uniMap.set(a.universityName, {
      ...existing,
      app: { operator: a.operator, developer: a.developer },
    });
  }

  const allUniversities = Array.from(uniMap.values()).sort((a, b) =>
    a.universityName.localeCompare(b.universityName, "ko"),
  );

  const changedCount = allUniversities.filter((u) =>
    u.changed?.includes("변경 O"),
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="담당자배정"
        description={`2027학년도 운영자/개발자 배정 현황 · 총 ${assignments.length}개 대학`}
        breadcrumb={["운영", "담당자배정"]}
      />

      <KpiGrid>
        <KpiCard
          icon={<IconSchool size={18} className="text-on-surface-variant" />}
          label="배정 대학"
          value={assignments.length.toString()}
          suffix="개"
        />
        <KpiCard
          icon={<IconUsers size={18} className="text-on-surface-variant" />}
          label="운영자"
          value={operatorSummary.length.toString()}
          suffix="명"
        />
        <KpiCard
          icon={<IconNetwork size={18} className="text-on-surface-variant" />}
          label="개발자"
          value={developerSummary.length.toString()}
          suffix="명"
        />
        <KpiCard
          icon={
            <IconAlertTriangle size={18} className="text-on-surface-variant" />
          }
          label="변경"
          value={changedCount.toString()}
          suffix="건"
          alert={changedCount > 0}
        />
      </KpiGrid>

      <AssignmentExplorer
        universities={allUniversities}
        operatorSummary={operatorSummary}
      />
    </div>
  );
}
