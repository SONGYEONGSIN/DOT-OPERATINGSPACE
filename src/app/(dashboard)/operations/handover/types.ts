export interface Service {
  id: number;
  reception_type: string | null;
  service_id: string | null;
  university_name: string | null;
  region: string | null;
  service_name: string | null;
  university_type: string | null;
  category: string | null;
  operator: string | null;
  developer: string | null;
  writing_start: string | null;
  writing_end: string | null;
  payment_start: string | null;
  payment_end: string | null;
  is_exclusive: boolean | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type StatusVariant = "success" | "warning" | "error" | "info" | "neutral";

export const STATUS_MAP: Record<
  string,
  { label: string; variant: StatusVariant }
> = {
  active: { label: "진행중", variant: "success" },
  completed: { label: "완료", variant: "info" },
  pending: { label: "예정", variant: "warning" },
  suspended: { label: "중단", variant: "error" },
} as const;

export function getStatusConfig(status: string | null): {
  label: string;
  variant: StatusVariant;
} {
  if (!status) return { label: "미정", variant: "neutral" };
  return STATUS_MAP[status] ?? { label: status, variant: "neutral" };
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "-";
  const now = new Date();
  const target = new Date(dateStr);
  const diffMs = now.getTime() - target.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}

export interface Profile {
  id: number;
  name: string;
  role: "admin" | "operator";
  team: "운영1팀" | "운영2팀";
  status: "active" | "inactive";
}

export interface HandoverLog {
  id: number;
  service_id: number;
  field: "operator" | "developer";
  from_person: string | null;
  to_person: string;
  memo: string | null;
  executed_by: string;
  executed_at: string;
  created_at: string;
  services?: { university_name: string | null; service_name: string | null };
}

export type HandoverField = "operator" | "developer";

export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string,
): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);
    return { ...acc, [key]: [...(acc[key] ?? []), item] };
  }, {});
}
