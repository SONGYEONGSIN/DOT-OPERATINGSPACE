import { createClient } from "@/lib/supabase/server";
import ProjectPage from "../_components/ProjectPage";
import type { ProjectTask, ProjectLog } from "../_components/types";

export default async function ReferralPage() {
  const supabase = createClient();

  const [{ data: tasks }, { data: profileRows }, { data: logs }] = await Promise.all([
    supabase
      .from("project_tasks")
      .select("*")
      .eq("project", "referral")
      .order("sort_order"),
    supabase
      .from("profiles")
      .select("name")
      .eq("status", "active")
      .order("name"),
    supabase
      .from("project_logs")
      .select("*")
      .eq("project", "referral")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <ProjectPage
      project="referral"
      tasks={(tasks ?? []) as ProjectTask[]}
      logs={(logs ?? []) as ProjectLog[]}
      profiles={(profileRows ?? []) as { name: string }[]}
      currentYear={2026}
    />
  );
}
