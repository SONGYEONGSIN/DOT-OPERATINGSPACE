export interface ProjectTask {
  id: number;
  project: string;
  title: string;
  description: string | null;
  status: "request" | "planning" | "development" | "testing" | "done" | "hold";
  priority: "low" | "medium" | "high" | "urgent";
  assignee: string | null;
  requester: string | null;
  due_date: string | null;
  year: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectLog {
  id: number;
  project: string;
  task_id: number | null;
  action: string;
  actor: string;
  detail: string | null;
  created_at: string;
}

export const STATUS_COLUMNS = [
  { key: "request", label: "요청", color: "text-tertiary" },
  { key: "planning", label: "기획", color: "text-on-surface-variant" },
  { key: "development", label: "개발", color: "text-primary" },
  { key: "testing", label: "테스트", color: "text-info" },
  { key: "done", label: "완료", color: "text-on-surface-variant" },
  { key: "hold", label: "보류", color: "text-error" },
] as const;

export const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "info" | "error" | "neutral" }> = {
  request: { label: "요청", variant: "warning" },
  planning: { label: "기획", variant: "neutral" },
  development: { label: "개발", variant: "info" },
  testing: { label: "테스트", variant: "success" },
  done: { label: "완료", variant: "neutral" },
  hold: { label: "보류", variant: "error" },
};

export const PRIORITY_CONFIG = {
  urgent: { label: "긴급", variant: "error" as const },
  high: { label: "높음", variant: "warning" as const },
  medium: { label: "보통", variant: "info" as const },
  low: { label: "낮음", variant: "neutral" as const },
} as const;

export const PROJECT_NAMES: Record<string, string> = {
  pims: "PIMS",
  reception: "접수관리자",
  internal: "내부관리자",
  competition: "경쟁률",
  generator: "생성툴",
  revenue: "매출/분석",
  settlement: "정산/진학캐쉬",
  k12: "초중고",
  kcue: "대학교육협의회",
  referral: "추천인검증",
  insurance: "보증보험",
  performance: "실적증명",
  notices: "유의사항",
};

export const YEARS = [2025, 2026, 2027] as const;

export const PROJECT_OWNERS: Record<string, string[]> = {
  pims: ["임종우", "김지현"],
  reception: ["이해영", "김지나"],
  internal: ["전혜인"],
  competition: ["기자의"],
  generator: ["정윤나", "전지은"],
  revenue: ["김지영"],
  settlement: ["박시현", "김승현"],
  k12: ["전혜인"],
  kcue: ["이해영", "김지나"],
  referral: ["김승현"],
  insurance: ["김지현"],
  performance: ["김지현"],
  notices: ["김지나"],
};
