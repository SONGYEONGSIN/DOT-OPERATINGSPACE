export interface BackupRequest {
  id: number;
  operator_name: string;
  operator_team: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  ops_backup_name: string;
  dev_backup_name: string | null;
  ops_backup_content: string;
  dev_backup_content: string;
  status: "작성 전" | "작성 완료";
  last_notified_at: string | null;
  created_at: string;
  updated_at: string;
}

export const LEAVE_TYPES = [
  { value: "연차", color: "neutral" },
  { value: "오전반차", color: "warning" },
  { value: "오후반차", color: "warning" },
  { value: "오전반반차", color: "info" },
  { value: "오후반반차", color: "info" },
  { value: "경조휴가", color: "error" },
  { value: "장기휴가", color: "error" },
  { value: "교육", color: "success" },
  { value: "출장", color: "success" },
  { value: "외근", color: "success" },
  { value: "기타", color: "neutral" },
] as const;

export type LeaveTypeColor = (typeof LEAVE_TYPES)[number]["color"];

export function getLeaveColor(type: string): LeaveTypeColor {
  return LEAVE_TYPES.find((t) => t.value === type)?.color ?? "neutral";
}
