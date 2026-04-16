import { PageHeader, Card } from "@/components/common";
import { IconCircleCheck, IconArrowBackUp, IconNote, IconBook, IconUser, IconBuilding, IconSchool, IconHammer, IconPrinter, IconWorld, IconApps, IconRocket, IconFileText, IconFileSpreadsheet, IconPresentation, IconFile, IconExternalLink } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import { getOnboardingTargets, getOperatorProgress, getOperatorLogs, getAllOnboardingLogs, getTrainingMaterials } from "./actions";
import type { OnboardingProgressItem } from "./actions";
import OnboardingTabs from "./OnboardingTabs";
import OperatorManage from "./OperatorManage";

const STEPS: {
  step: number;
  title: string;
  description: string;
  icon: typeof IconUser;
  items: { key: string; label: string; hint: string }[];
}[] = [
  {
    step: 1, title: "입사 및 계정 설정",
    description: "첫날 인사, 자리 안내, 계정 세팅을 완료하세요.",
    icon: IconUser,
    items: [
      { key: "s1_greet", label: "인사 및 자리 안내", hint: "팀장/사수 매니저와 인사, 좌석 배정" },
      { key: "s1_account", label: "계정 발급 및 지문 등록", hint: "시스템 계정 발급, 4층 지문 등록 (9~10시)" },
      { key: "s1_desktop", label: "데스크탑 세팅", hint: "PC 설치, 필요 프로그램 세팅" },
      { key: "s1_profile", label: "Orchestrator System 프로필 등록", hint: "좌측 하단 계정정보에서 이름/팀/사진 설정" },
      { key: "s1_password", label: "비밀번호 변경", hint: "계정정보 > 비밀번호 초기화" },
    ],
  },
  {
    step: 2, title: "조직 및 업무 소개",
    description: "조직 구조, 진학어플라이 서비스, 계약 프로세스를 이해하세요.",
    icon: IconBuilding,
    items: [
      { key: "s2_org", label: "조직 소개 및 교육과정 안내", hint: "서비스사업부 조직 구성, 교육 일정 확인" },
      { key: "s2_site", label: "진학어플라이 사이트 및 업무 소개", hint: "진학어플라이 서비스 전반 이해" },
      { key: "s2_contract", label: "계약 및 업무 프로세스", hint: "계약서 작성/진행, 날인 프로세스, 보증보험, 대학 자료 요청" },
      { key: "s2_system", label: "Orchestrator System 메뉴 구조 파악", hint: "대시보드, 브리핑, 전체일정, 서비스관리 등 확인" },
    ],
  },
  {
    step: 3, title: "내부 시스템 교육",
    description: "내부관리자, 성적산출, 대학관리자 페이지를 학습하세요.",
    icon: IconSchool,
    items: [
      { key: "s3_internal", label: "내부관리자 페이지 교육", hint: "내부관리자 페이지 주요 기능 소개" },
      { key: "s3_score", label: "성적산출 페이지 교육", hint: "수시/정시 내신·수능 성적산출 방법" },
      { key: "s3_univ_admin", label: "대학관리자 페이지 교육", hint: "대학관리자 페이지 구조 및 주요 기능" },
    ],
  },
  {
    step: 4, title: "기초데이터 및 생성툴",
    description: "기초데이터 작성법과 생성툴 사용법을 실습하세요.",
    icon: IconHammer,
    items: [
      { key: "s4_basic_theory", label: "기초데이터 작성법 교육", hint: "기초데이터 항목별 작성 방법 이론" },
      { key: "s4_basic_practice", label: "기초데이터 실습", hint: "담당 대학 기초데이터 직접 작성" },
      { key: "s4_generator_theory", label: "생성툴 사용법 교육", hint: "생성툴 기능 및 페이지 생성 방법" },
      { key: "s4_generator_practice", label: "생성툴 실습", hint: "담당 대학 공통원서 페이지 생성 실습" },
    ],
  },
  {
    step: 5, title: "유의사항 · 출력물 · 전산",
    description: "유의사항, 오즈(출력물), 전산파일 제작법을 학습하세요.",
    icon: IconPrinter,
    items: [
      { key: "s5_notice", label: "유의사항 페이지 제작법", hint: "대학별 유의사항 작성 및 관리 방법" },
      { key: "s5_oz", label: "출력물(오즈) 제작법", hint: "오즈 리포트 디자이너 사용법" },
      { key: "s5_digital", label: "전산파일 세팅법", hint: "전산 파일 제작 및 업로드 방법" },
      { key: "s5_practice", label: "유의사항/오즈/전산 실습", hint: "담당 대학 기준 실습" },
    ],
  },
  {
    step: 6, title: "엔터사이트 교육",
    description: "엔터사이트 구조를 이해하고 담당 대학을 실습하세요.",
    icon: IconWorld,
    items: [
      { key: "s6_enter_theory", label: "엔터사이트 교육", hint: "엔터 구조, 파일 업로드 세팅 방법" },
      { key: "s6_enter_practice", label: "엔터사이트 담당 대학 실습", hint: "담당 대학 기준 엔터 사이트 직접 세팅" },
      { key: "s6_enter_feedback", label: "엔터 실습 피드백", hint: "사수 매니저에게 실습 결과 피드백 받기" },
    ],
  },
  {
    step: 7, title: "부가 업무 교육",
    description: "콜프로그램, 경쟁률, PIMS, 정산 등 부가 업무를 학습하세요.",
    icon: IconApps,
    items: [
      { key: "s7_call", label: "콜프로그램 세팅", hint: "콜 프로그램 세팅, 1:1 게시판 사용법" },
      { key: "s7_competition", label: "경쟁률 페이지 제작", hint: "대학별 경쟁률 페이지 생성 방법" },
      { key: "s7_pims", label: "PIMS 교육", hint: "합격자통합관리시스템 소개 및 세팅" },
      { key: "s7_settlement", label: "정산 교육", hint: "운영자 지출결의 방법 및 전표 발행" },
    ],
  },
  {
    step: 8, title: "실전 업무 시작",
    description: "담당 대학을 확인하고 실제 업무를 시작하세요.",
    icon: IconRocket,
    items: [
      { key: "s8_assignment", label: "담당 대학 배정 확인", hint: "관리자 > 대학배정 메뉴에서 확인" },
      { key: "s8_service_detail", label: "담당 서비스 상세 확인", hint: "서비스 관리에서 담당 대학 클릭" },
      { key: "s8_worklog", label: "작업이력 1건 작성", hint: "서비스 상세 > 작업이력에서 항목별 작성" },
      { key: "s8_practice", label: "개인 실습 과제 수행", hint: "교육 내용 기반 실습 과제 진행" },
      { key: "s8_eval", label: "최종 교육 평가", hint: "사수 매니저와 교육 평가 및 Q&A" },
      { key: "s8_complete", label: "온보딩 완료 보고", hint: "팀장에게 온보딩 완료 보고" },
    ],
  },
];

const TOTAL_ITEMS = STEPS.flatMap((s) => s.items).length;


export default async function OnboardingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: { name: string; team: string; role: string; created_at: string } | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("name, team, role, created_at").eq("email", user.email!).single();
    profile = data;
  }

  // 교육자료
  const materials = await getTrainingMaterials();

  // 온보딩 대상자
  const targets = await getOnboardingTargets();
  const operatorProgressMap: Record<string, OnboardingProgressItem[]> = {};
  const operatorLogsMap: Record<string, import("./actions").OnboardingLog[]> = {};
  for (const t of targets) {
    operatorProgressMap[t.user_email] = await getOperatorProgress(t.user_email);
    operatorLogsMap[t.user_email] = await getOperatorLogs(t.user_email);
  }

  // 전체 기록
  const allLogs = await getAllOnboardingLogs();

  // 프로필 목록 (대상자 추가용)
  const { data: allProfiles } = await supabase.from("profiles").select("email, name").eq("status", "active").order("name");
  const nameMap = new Map((allProfiles ?? []).map((p) => [p.email, p.name]));
  const availableProfiles = (allProfiles ?? []).map((p) => ({ email: p.email, name: p.name }));

  // ── Guide Content ──
  const guideContent = (
    <div className="space-y-6">
      <Card className="p-5 !border-primary/20">
        <div className="flex items-center gap-4">
          <IconBook size={28} className="text-primary" />
          <div>
            <h3 className="text-base font-bold text-[var(--color-text)]">신입사원 온보딩 가이드</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">2주 교육과정 기반 단계별 가이드입니다. 진행 관리는 운영자 관리 탭에서 할 수 있습니다.</p>
          </div>
        </div>
      </Card>

      {/* 가이드 (읽기 전용) */}
      <div className="space-y-4">
        {STEPS.map((step) => (
          <Card key={step.step} className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-[14px] bg-primary/10 flex items-center justify-center">
                <step.icon size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)]">{step.title}</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{step.description}</p>
              </div>
            </div>
            <div className="ml-12 space-y-2">
              {step.items.map((item) => (
                <div key={item.key} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 mt-0.5 rounded-md border border-black/[0.04] flex items-center justify-center shrink-0 text-[10px] font-bold text-[var(--color-text-muted)]">
                    {step.items.indexOf(item) + 1}
                  </span>
                  <div>
                    <p className="text-sm text-[var(--color-text)]">{item.label}</p>
                    {item.hint && <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{item.hint}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // ── Manage Content ──
  const manageSteps = STEPS.map((s) => ({ step: s.step, title: s.title, items: s.items.map((i) => ({ key: i.key, label: i.label })) }));
  const manageContent = (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-[var(--color-text)]">온보딩 체크리스트</h3>
        </div>
        <OperatorManage targets={targets} steps={manageSteps} totalItemCount={TOTAL_ITEMS} operatorProgressMap={operatorProgressMap} operatorLogsMap={operatorLogsMap} availableProfiles={availableProfiles} />
      </Card>
    </div>
  );

  // ── History Content ──
  const historyContent = (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="text-sm font-bold text-[var(--color-text)] mb-4">전체 온보딩 기록</h3>
        {allLogs.length > 0 ? (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {allLogs.map((log) => {
              const time = new Date(log.created_at);
              const timeStr = time.toLocaleDateString("ko-KR", { month: "short", day: "numeric" }) + " " + time.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
              const userName = nameMap.get(log.user_email) ?? log.user_email;
              return (
                <div key={log.id} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${log.action === "complete" ? "bg-primary/10" : log.action === "memo" ? "bg-tertiary/10" : "bg-[var(--color-surface)]"}`}>
                    {log.action === "complete" ? <IconCircleCheck size={14} className="text-primary" /> : log.action === "memo" ? <IconNote size={14} className="text-tertiary" /> : <IconArrowBackUp size={14} className="text-[var(--color-text-muted)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--color-text)]">{userName}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">{timeStr}</span>
                    </div>
                    {log.action === "memo" ? (
                      <p className="text-sm text-[var(--color-text)] mt-0.5">{log.memo}</p>
                    ) : (
                      <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                        <span className="text-[var(--color-text)] font-medium">{log.item_label}</span> {log.action === "complete" ? "완료" : "취소"}
                        {log.memo && <span className="text-[10px] text-[var(--color-text-muted)] ml-2">({log.memo})</span>}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[var(--color-text-muted)] text-center py-8">아직 기록이 없습니다.</p>
        )}
      </Card>
    </div>
  );

  // ── Materials Content ──
  const fileIcon = (type: string) => {
    if (type === "doc" || type === "docx" || type === "hwp") return <IconFileText size={16} className="text-primary" />;
    if (type === "xls" || type === "xlsx") return <IconFileSpreadsheet size={16} className="text-tertiary" />;
    if (type === "ppt" || type === "pptx") return <IconPresentation size={16} className="text-error" />;
    if (type === "pdf") return <IconFile size={16} className="text-[var(--color-text-muted)]" />;
    return <IconFile size={16} className="text-[var(--color-text-muted)]" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  // 폴더별 그룹
  const folderGroups = new Map<string, typeof materials>();
  for (const m of materials) {
    const folder = m.folder ?? "기타";
    if (!folderGroups.has(folder)) folderGroups.set(folder, []);
    folderGroups.get(folder)!.push(m);
  }

  const materialsContent = (
    <div className="space-y-6">
      <Card className="p-5 !border-primary/20">
        <div className="flex items-center gap-4">
          <IconBook size={28} className="text-primary" />
          <div>
            <h3 className="text-base font-bold text-[var(--color-text)]">교육자료</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">SharePoint 매뉴얼 폴더의 교육 자료입니다. 클릭하면 SharePoint에서 열립니다.</p>
          </div>
          <span className="ml-auto text-xs font-bold text-[var(--color-text-muted)]">{materials.length}개 파일</span>
        </div>
      </Card>

      {[...folderGroups.entries()].map(([folder, files]) => (
        <Card key={folder} className="p-5">
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-3">{folder}</h3>
          <div className="space-y-1.5">
            {files.map((file, idx) => (
              <a
                key={idx}
                href={file.webUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-[14px] hover:bg-[var(--color-surface)]/50 transition-colors group"
              >
                {fileIcon(file.type)}
                <span className="flex-1 text-sm text-[var(--color-text)] group-hover:text-primary transition-colors truncate">{file.name}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">{file.type}</span>
                <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">{formatSize(file.size)}</span>
                <IconExternalLink size={12} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </Card>
      ))}

      {materials.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">교육자료를 불러올 수 없습니다.</p>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="온보딩"
        description="Orchestrator System을 효과적으로 시작하기 위한 단계별 가이드입니다."
        breadcrumb={["지원", "온보딩"]}
      />
      <OnboardingTabs guideContent={guideContent} materialsContent={materialsContent} manageContent={manageContent} historyContent={historyContent} />
    </div>
  );
}
